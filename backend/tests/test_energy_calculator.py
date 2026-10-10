import pytest
from datetime import datetime
from app.services.energy_calculator import EnergyCalculator
from app.models.alert import AlertSeverity

def test_energy_difference_and_loss_percentage():
    # Transformer input: 100 kWh, Consumer sum: 85 kWh
    # Difference: 15 kWh, Loss: 15.0%
    ts_offpeak = datetime(2026, 10, 10, 14, 0, 0)
    result = EnergyCalculator.calculate_energy_difference(100.0, 85.0, ts_offpeak)

    assert result["energy_difference_kwh"] == 15.0
    assert result["loss_percentage"] == 15.0
    assert result["is_peak_hour"] is False
    assert result["is_anomaly"] is True
    # Verify technical vs unexplained breakdown
    assert result["expected_technical_loss_kwh"] == 6.0
    assert result["unexplained_loss_kwh"] == 9.0

def test_peak_hour_identification():
    # Peak hour is 19:00 to 22:00 (7 PM - 10 PM)
    ts_peak = datetime(2026, 10, 10, 20, 30, 0) # 8:30 PM
    assert EnergyCalculator.is_peak_hour(ts_peak) is True

    ts_offpeak = datetime(2026, 10, 10, 11, 0, 0) # 11:00 AM
    assert EnergyCalculator.is_peak_hour(ts_offpeak) is False

def test_normal_loss_within_threshold():
    # 5% loss is within normal technical limits
    ts = datetime(2026, 10, 10, 15, 0, 0)
    result = EnergyCalculator.calculate_energy_difference(200.0, 190.0, ts)
    
    assert result["loss_percentage"] == 5.0
    assert result["is_anomaly"] is False
    assert result["anomaly_severity"] == AlertSeverity.LOW

def test_negative_difference_flagged():
    # Negative difference indicates consumer meters reading higher than transformer input
    ts = datetime(2026, 10, 10, 12, 0, 0)
    result = EnergyCalculator.calculate_energy_difference(100.0, 105.0, ts)
    
    assert result["energy_difference_kwh"] == -5.0
    assert result["loss_percentage"] == -5.0
    assert result["is_anomaly"] is True
    assert "Negative difference detected" in result["anomaly_reason"]
