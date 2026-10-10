// =====================================================================================
// Project: Transformer Energy Loss Detection System (TELDS)
// File: enclosure_model.scad
// Description: Parametric 3D Printable Weatherproof Enclosure for ESP32 Dual-CT Node
// Compatible with: OpenSCAD, FreeCAD, Blender, and all slicers (Cura, PrusaSlicer)
// =====================================================================================

$fn = 60; // Circle smoothness

// Outer Dimensions (mm)
length = 140.0;
width  = 100.0;
height = 50.0;
wall_t = 3.0;
corner_r = 6.0;

// PCB Mounting Parameters
pcb_l = 100.0;
pcb_w = 80.0;
pcb_h_standoff = 6.0;
standoff_r = 4.0;
screw_hole_r = 1.6; // M3 clearance

// Gland Cutouts (mm)
pg9_diam = 15.5; // For CT1 and CT2 cables
pg7_diam = 12.5; // For AC mains cable

// OLED Cutout Dimensions
oled_w = 28.0;
oled_h = 15.0;

// Render Mode: "all", "base", or "lid"
part = "all"; 

module rounded_box(l, w, h, r) {
    hull() {
        translate([r, r, 0]) cylinder(r=r, h=h);
        translate([l-r, r, 0]) cylinder(r=r, h=h);
        translate([r, w-r, 0]) cylinder(r=r, h=h);
        translate([l-r, w-r, 0]) cylinder(r=r, h=h);
    }
}

// 1. Enclosure Base Body
module enclosure_base() {
    difference() {
        // Outer Shell
        rounded_box(length, width, height, corner_r);
        
        // Inner Cavity
        translate([wall_t, wall_t, wall_t])
            rounded_box(length - 2*wall_t, width - 2*wall_t, height, corner_r - 1);
            
        // Gland Hole 1: CT1 Input (Left wall)
        translate([0, width*0.35, height*0.45])
            rotate([0, 90, 0])
                cylinder(r=pg9_diam/2, h=wall_t*3, center=true);
                
        // Gland Hole 2: CT2 Output (Left wall)
        translate([0, width*0.65, height*0.45])
            rotate([0, 90, 0])
                cylinder(r=pg9_diam/2, h=wall_t*3, center=true);
                
        // Gland Hole 3: Mains AC (Right wall)
        translate([length, width*0.5, height*0.45])
            rotate([0, 90, 0])
                cylinder(r=pg7_diam/2, h=wall_t*3, center=true);
    }
    
    // Internal PCB Mounting Standoffs (4 corners of PCB)
    pcb_offset_x = (length - pcb_l) / 2;
    pcb_offset_y = (width - pcb_w) / 2;
    
    pcb_posts = [
        [pcb_offset_x + 5, pcb_offset_y + 5],
        [pcb_offset_x + pcb_l - 5, pcb_offset_y + 5],
        [pcb_offset_x + 5, pcb_offset_y + pcb_w - 5],
        [pcb_offset_x + pcb_l - 5, pcb_offset_y + pcb_w - 5]
    ];
    
    for (pos = pcb_posts) {
        translate([pos[0], pos[1], wall_t]) {
            difference() {
                cylinder(r=standoff_r, h=pcb_h_standoff);
                cylinder(r=screw_hole_r, h=pcb_h_standoff + 1);
            }
        }
    }
    
    // External Mounting Flanges (Pole / Wall Bracket Mount)
    translate([-12, width*0.2, 0]) cube([12, 16, 4]);
    translate([-12, width*0.8 - 16, 0]) cube([12, 16, 4]);
    translate([length, width*0.2, 0]) cube([12, 16, 4]);
    translate([length, width*0.8 - 16, 0]) cube([12, 16, 4]);
}

// 2. Enclosure Top Lid
module enclosure_lid() {
    lid_t = 3.5;
    difference() {
        // Lid Plate
        rounded_box(length, width, lid_t, corner_r);
        
        // OLED Viewing Window Cutout
        translate([(length - oled_w)/2, width*0.35, -1])
            cube([oled_w, oled_h, lid_t + 2]);
            
        // LED 1 Indicator Hole (5mm)
        translate([(length - oled_w)/2 - 12, width*0.35 + 7.5, -1])
            cylinder(r=2.6, h=lid_t + 2);
            
        // LED 2 Indicator Hole (5mm)
        translate([(length + oled_w)/2 + 12, width*0.35 + 7.5, -1])
            cylinder(r=2.6, h=lid_t + 2);
            
        // Buzzer Sound Output Grille (3 small slots)
        for (i = [-5, 0, 5]) {
            translate([length*0.5 + i, width*0.75, -1])
                cube([2, 12, lid_t + 2]);
        }
        
        // 4 Lid Screw Holes
        translate([corner_r, corner_r, -1]) cylinder(r=screw_hole_r, h=lid_t+2);
        translate([length-corner_r, corner_r, -1]) cylinder(r=screw_hole_r, h=lid_t+2);
        translate([corner_r, width-corner_r, -1]) cylinder(r=screw_hole_r, h=lid_t+2);
        translate([length-corner_r, width-corner_r, -1]) cylinder(r=screw_hole_r, h=lid_t+2);
    }
    
    // Lip for Gasket Sealing Rim
    translate([wall_t + 0.5, wall_t + 0.5, lid_t])
        difference() {
            rounded_box(length - 2*wall_t - 1, width - 2*wall_t - 1, 2.5, corner_r - 2);
            translate([2, 2, -1])
                rounded_box(length - 2*wall_t - 5, width - 2*wall_t - 5, 4.5, corner_r - 3);
        }
}

// Model Assembly Display
if (part == "all") {
    enclosure_base();
    translate([0, 0, height + 15]) enclosure_lid(); // Hovering lid view
} else if (part == "base") {
    enclosure_base();
} else if (part == "lid") {
    enclosure_lid();
}
