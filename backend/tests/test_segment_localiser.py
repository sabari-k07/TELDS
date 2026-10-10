import pytest
from app.services.segment_localiser import SegmentLocalisationEngine

def test_scenario_normal_balance():
    """Verify Scenario A: all segments operate within technical line loss bounds."""
    data = SegmentLocalisationEngine.generate_scenario_data("SCENARIO_NORMAL")
    assert data["meta"]["id"] == "SCENARIO_NORMAL"
    assert data["summary"]["abnormal_segments_count"] == 0
    assert len(data["segments"]) == 4

    for seg in data["segments"]:
        assert seg["status"] == "NORMAL"
        assert seg["is_suspected_abnormal"] is False
        assert seg["discrepancy_pct"] <= seg["effective_threshold_pct"]

def test_scenario_anomaly_localisation():
    """Verify Scenario B: only Segment P2-P3 is flagged with abnormal loss."""
    data = SegmentLocalisationEngine.generate_scenario_data("SCENARIO_ANOMALY_P2_P3")
    assert data["summary"]["abnormal_segments_count"] == 1
    assert "SEG-P2-P3" in data["summary"]["abnormal_segment_ids"]

    # Verify P2-P3 specifics
    seg_p2_p3 = next(s for s in data["segments"] if s["segment_id"] == "SEG-P2-P3")
    assert seg_p2_p3["status"] == "INVESTIGATION_RECOMMENDED"
    assert seg_p2_p3["is_suspected_abnormal"] is True
    assert seg_p2_p3["discrepancy_pct"] > 15.0

    # Verify other segments remain NORMAL
    other_segs = [s for s in data["segments"] if s["segment_id"] != "SEG-P2-P3"]
    for s in other_segs:
        assert s["status"] == "NORMAL"
        assert s["is_suspected_abnormal"] is False

def test_scenario_sensor_hardware_fault():
    """Verify Scenario C: node failure marks adjacent segments as SENSOR_FAULT, not theft."""
    data = SegmentLocalisationEngine.generate_scenario_data("SCENARIO_SENSOR_FAULT")
    assert data["summary"]["abnormal_segments_count"] == 0
    assert "SEG-P1-P2" in data["summary"]["faulty_segment_ids"]
    assert "SEG-P2-P3" in data["summary"]["faulty_segment_ids"]

    for seg in data["segments"]:
        if "P2" in seg["segment_id"]:
            assert seg["status"] == "SENSOR_FAULT"
            assert seg["is_suspected_abnormal"] is False
            assert "fault" in seg["remarks"].lower()

def test_scenario_missing_or_delayed_telemetry():
    """Verify Scenario D: packet loss marks segments as UNCERTAIN_DATA rather than false alarm."""
    data = SegmentLocalisationEngine.generate_scenario_data("SCENARIO_MISSING_DATA")
    assert data["summary"]["abnormal_segments_count"] == 0
    assert "SEG-P0-P1" in data["summary"]["uncertain_segment_ids"]
    assert "SEG-P1-P2" in data["summary"]["uncertain_segment_ids"]

    for seg in data["segments"]:
        if "P1" in seg["segment_id"]:
            assert seg["status"] == "UNCERTAIN_DATA"
            assert seg["is_suspected_abnormal"] is False
            assert "insufficient" in seg["remarks"].lower() or "delayed" in seg["remarks"].lower()

def test_math_and_uncertainty_thresholds():
    """Verify that measurement uncertainty is added to the technical loss threshold."""
    # Upstream 100 kWh, Downstream 94 kWh (6% diff).
    # Tech loss: 2%, Uncertainty: 1.5%, Configured threshold: 5.0%.
    # Effective threshold = 5.0 + 1.5 = 6.5%.
    # Discrepancy (6%) < 6.5% -> Should be NORMAL!
    res_within = SegmentLocalisationEngine.calculate_segment_loss(
        upstream_energy_kwh=100.0,
        downstream_energy_kwh=94.0,
        branch_energy_kwh=0.0,
        expected_tech_loss_pct=2.0,
        uncertainty_pct=1.5,
        threshold_pct=5.0
    )
    assert res_within["status"] == "NORMAL"
    assert res_within["effective_threshold_pct"] == 6.5

    # If downstream is 92 kWh (8% diff) > 6.5% -> INVESTIGATION_RECOMMENDED!
    res_exceed = SegmentLocalisationEngine.calculate_segment_loss(
        upstream_energy_kwh=100.0,
        downstream_energy_kwh=92.0,
        branch_energy_kwh=0.0,
        expected_tech_loss_pct=2.0,
        uncertainty_pct=1.5,
        threshold_pct=5.0
    )
    assert res_exceed["status"] == "INVESTIGATION_RECOMMENDED"
    assert res_exceed["is_suspected_abnormal"] is True
    assert res_exceed["unexplained_loss_kwh"] == 6.0  # 8.0 - 2.0
