# TELDS 3D Enclosure Mechanical Specification

## 1. Physical Specifications & Dimensions

| Feature | Dimension / Specification | Purpose |
|---|---|---|
| **Outer Dimensions** | 140.0 mm (L) × 100.0 mm (W) × 50.0 mm (H) | Accommodates 100×80mm PCB and cable bends |
| **Wall Thickness** | 3.0 mm uniform | Structural rigidity against industrial vibration |
| **Material** | UV-Stabilized Polycarbonate (PC) / ABS-FR (UL94 V-0) | Flame retardant, weather & impact resistant |
| **Ingress Protection** | IP54 (Dust protected, splashing water resistant) | Certified for outdoor substation enclosures |
| **Gasket Channel** | 2.5 mm deep silicone O-ring tongue-and-groove | Prevents moisture & dust ingress |
| **Cable Glands (Left)** | 2 × PG9 (15.5 mm diameter) | Sealed pass-through for CT1 & CT2 sensor cables |
| **Cable Gland (Right)** | 1 × PG7 (12.5 mm diameter) | Sealed pass-through for 230V AC utility power |
| **Display Cutout** | 28.0 mm × 15.0 mm | Bezel aperture for SSD1306 0.96" OLED |
| **Viewing Window** | 1.5 mm transparent acrylic insert | Sealed with UV-cure adhesive |
| **Mounting Standoffs** | 4 × M3 (6.0 mm height, brass heat-set inserts) | Holds PCB securely above enclosure floor |
| **External Mount** | 4 × External heavy-duty flanges with 4.5mm slots | Pole-strap or wall-screw mounting |

---

## 2. 3D Printing & Tooling Guidelines

For rapid prototyping and low-volume production:
- **Printing Technology:** Fused Deposition Modeling (FDM) or Selective Laser Sintering (SLS).
- **Recommended Filament:** ASA (Acrylonitrile Styrene Acrylate) or PETG for outdoor UV stability. Avoid standard PLA due to thermal degradation in summer transformer environments (50°C+).
- **Infill Percentage:** 40% – 50% Gyroid infill for isotropic mechanical strength.
- **Perimeter Shells:** 4 wall lines (1.6 mm total shell thickness).
- **Layer Height:** 0.20 mm for optimal surface finish and tight gasket tolerances.
- **Fasteners:** 4 × M3 × 12mm stainless steel socket head cap screws for the lid.
