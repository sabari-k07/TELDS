import io
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.transformer import Transformer, Consumer
from app.models.reading import TransformerReading, ConsumerReading, EnergyAnalysis
from app.models.alert import Alert, AlertStatus
from app.services.energy_calculator import EnergyCalculator

class CSVProcessorService:
    """
    Validates and processes meter readings CSV uploads.
    Supports time alignment, batch reading insertion, and instant analytics generation.
    """

    @staticmethod
    def parse_datetime(val: Any) -> datetime:
        if isinstance(val, datetime):
            return val
        return pd.to_datetime(val).to_pydatetime()

    @classmethod
    def process_combined_readings_csv(
        cls, 
        file_content: bytes, 
        db: Session
    ) -> Dict[str, Any]:
        """
        Accepts CSV with columns:
        transformer_code, timestamp, transformer_kwh, consumer_meter_number, consumer_kwh
        """
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Validation of required columns
        req_cols = {"transformer_code", "timestamp", "transformer_kwh", "consumer_meter_number", "consumer_kwh"}
        if not req_cols.issubset(df.columns):
            missing = list(req_cols - set(df.columns))
            raise ValueError(f"Missing required CSV columns: {missing}. Required columns: {list(req_cols)}")

        # Clean and type-cast
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["transformer_kwh"] = pd.to_numeric(df["transformer_kwh"], errors="coerce").fillna(0.0)
        df["consumer_kwh"] = pd.to_numeric(df["consumer_kwh"], errors="coerce").fillna(0.0)

        records_processed = 0
        analyses_generated = 0
        anomalies_detected = 0
        errors: List[str] = []

        # Cache existing transformers and consumers
        transformers_map = {t.code: t for t in db.query(Transformer).all()}
        consumers_map = {c.meter_number: c for c in db.query(Consumer).all()}

        # Group by transformer_code and timestamp to calculate aggregated intervals
        grouped = df.groupby(["transformer_code", "timestamp"])

        for (tx_code, ts), group in grouped:
            tx = transformers_map.get(str(tx_code))
            if not tx:
                errors.append(f"Transformer code '{tx_code}' not found in database. Skipped interval {ts}.")
                continue

            tx_input_kwh = float(group["transformer_kwh"].iloc[0])
            consumer_sum_kwh = float(group["consumer_kwh"].sum())

            # Store individual consumer readings
            for _, row in group.iterrows():
                meter_num = str(row["consumer_meter_number"])
                cons = consumers_map.get(meter_num)
                if cons:
                    reading = ConsumerReading(
                        consumer_id=cons.id,
                        timestamp=ts.to_pydatetime(),
                        energy_kwh=float(row["consumer_kwh"])
                    )
                    db.add(reading)
                    records_processed += 1

            # Store transformer reading
            tx_reading = TransformerReading(
                transformer_id=tx.id,
                timestamp=ts.to_pydatetime(),
                energy_kwh=tx_input_kwh
            )
            db.add(tx_reading)
            records_processed += 1

            # Run analytical loss calculation
            calc = EnergyCalculator.calculate_energy_difference(
                transformer_input_kwh=tx_input_kwh,
                consumer_total_kwh=consumer_sum_kwh,
                timestamp=ts.to_pydatetime()
            )

            analysis = EnergyAnalysis(
                transformer_id=tx.id,
                timestamp=ts.to_pydatetime(),
                interval_type="hourly",
                transformer_input_kwh=calc["transformer_input_kwh"],
                consumer_total_kwh=calc["consumer_total_kwh"],
                energy_difference_kwh=calc["energy_difference_kwh"],
                loss_percentage=calc["loss_percentage"],
                expected_technical_loss_kwh=calc["expected_technical_loss_kwh"],
                unexplained_loss_kwh=calc["unexplained_loss_kwh"],
                is_peak_hour=calc["is_peak_hour"],
                is_anomaly=calc["is_anomaly"],
                anomaly_reason=calc["anomaly_reason"]
            )
            db.add(analysis)
            db.flush() # Ensure analysis.id is generated
            analyses_generated += 1

            # Generate Alert if anomalous
            if calc["is_anomaly"]:
                anomalies_detected += 1
                alert = Alert(
                    transformer_id=tx.id,
                    analysis_id=analysis.id,
                    title=f"Unexplained Energy Discrepancy on {tx.name}",
                    severity=calc["anomaly_severity"],
                    status=AlertStatus.OPEN,
                    loss_percentage=calc["loss_percentage"],
                    energy_difference_kwh=calc["energy_difference_kwh"],
                    is_peak_hour=calc["is_peak_hour"],
                    description=f"{calc['anomaly_reason']}. Difference: {calc['energy_difference_kwh']} kWh. Feeder investigation advised."
                )
                db.add(alert)

        db.commit()

        return {
            "status": "success",
            "records_processed": records_processed,
            "records_failed": len(errors),
            "analyses_generated": analyses_generated,
            "anomalies_detected": anomalies_detected,
            "errors": errors
        }
