from datetime import datetime
from typing import Tuple, Dict, Any
from app.core.config import settings
from app.models.alert import AlertSeverity

class EnergyCalculator:
    """
    Core Mathematical Engine for TELDS:
    1. Energy difference = Transformer input energy - Total consumer energy
    2. Energy difference percentage = (Energy difference / Transformer input energy) * 100
    
    Distinguishes technical losses from unexplained differences.
    CRITICAL RULE: Never automatically labels unexplained loss as electricity theft.
    """
    
    @staticmethod
    def is_peak_hour(timestamp: datetime) -> bool:
        """
        Peak hours are specifically between 7:00 PM and 10:00 PM (19:00 - 22:00).
        """
        hour = timestamp.hour
        return settings.PEAK_HOUR_START <= hour < settings.PEAK_HOUR_END

    @classmethod
    def calculate_energy_difference(
        cls,
        transformer_input_kwh: float,
        consumer_total_kwh: float,
        timestamp: datetime
    ) -> Dict[str, Any]:
        if transformer_input_kwh < 0 or consumer_total_kwh < 0:
            raise ValueError("Energy readings cannot be negative values.")

        # Formula 1: Energy difference = Transformer input energy - Total consumer energy
        diff_kwh = round(transformer_input_kwh - consumer_total_kwh, 4)
        
        # Formula 2: Energy difference percentage = (Energy difference / Transformer input energy) * 100
        if transformer_input_kwh > 0:
            loss_pct = round((diff_kwh / transformer_input_kwh) * 100.0, 2)
        else:
            loss_pct = 0.0

        peak_flag = cls.is_peak_hour(timestamp)

        # Technical loss estimation: e.g. 6% normal resistance/iron losses
        tech_loss_allowance = settings.TECHNICAL_LOSS_ALLOWANCE_PERCENT
        expected_tech_loss_kwh = round(transformer_input_kwh * (tech_loss_allowance / 100.0), 4)
        unexplained_loss_kwh = round(max(0.0, diff_kwh - expected_tech_loss_kwh), 4)

        # Determine anomaly & severity
        is_anomaly = False
        severity = AlertSeverity.LOW
        anomaly_reason = None

        # Peak hours have higher sensitivity
        threshold = settings.WARNING_LOSS_THRESHOLD_PERCENT
        if peak_flag:
            threshold = settings.WARNING_LOSS_THRESHOLD_PERCENT - 2.0 # More strict in peak hours

        if loss_pct >= settings.CRITICAL_LOSS_THRESHOLD_PERCENT:
            is_anomaly = True
            severity = AlertSeverity.CRITICAL
            anomaly_reason = f"Critical unexplained loss of {loss_pct}% detected (exceeds {settings.CRITICAL_LOSS_THRESHOLD_PERCENT}% limit)."
        elif loss_pct >= threshold:
            is_anomaly = True
            severity = AlertSeverity.HIGH if peak_flag else AlertSeverity.MEDIUM
            anomaly_reason = f"Elevated energy discrepancy of {loss_pct}% during {'peak' if peak_flag else 'standard'} hours."
        elif loss_pct < -2.0:
            # Negative difference indicates meter mismatch or reverse flow
            is_anomaly = True
            severity = AlertSeverity.HIGH
            anomaly_reason = f"Negative difference detected ({loss_pct}%): Consumer meters recorded higher consumption than transformer input. Potential meter calibration error."

        return {
            "transformer_input_kwh": transformer_input_kwh,
            "consumer_total_kwh": consumer_total_kwh,
            "energy_difference_kwh": diff_kwh,
            "loss_percentage": loss_pct,
            "expected_technical_loss_kwh": expected_tech_loss_kwh,
            "unexplained_loss_kwh": unexplained_loss_kwh,
            "is_peak_hour": peak_flag,
            "is_anomaly": is_anomaly,
            "anomaly_severity": severity,
            "anomaly_reason": anomaly_reason
        }
