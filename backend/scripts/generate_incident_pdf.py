import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def create_pharmaceutical_incident_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom Turquoise & Dark Oceanic Palette matching ORYVEX branding
    TURQUOISE_DARK = colors.HexColor("#08495c")
    TURQUOISE_PRIMARY = colors.HexColor("#0891b2")
    TURQUOISE_LIGHT = colors.HexColor("#e0f2fe")
    TURQUOISE_BORDER = colors.HexColor("#a5f3fc")
    SLATE_DARK = colors.HexColor("#0f172a")
    SLATE_MUTED = colors.HexColor("#475569")
    CRITICAL_RED = colors.HexColor("#be123c")
    CRITICAL_BG = colors.HexColor("#ffe4e6")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=19,
        textColor=TURQUOISE_DARK,
        alignment=0
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=TURQUOISE_PRIMARY,
        textTransform='uppercase',
        alignment=0
    )

    section_header_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.white,
        spaceAfter=0
    )

    label_style = ParagraphStyle(
        'CellLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=SLATE_MUTED
    )

    value_style = ParagraphStyle(
        'CellValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=SLATE_DARK
    )

    value_bold_style = ParagraphStyle(
        'CellValueBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=SLATE_DARK
    )

    critical_style = ParagraphStyle(
        'CellCritical',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=CRITICAL_RED
    )

    body_style = ParagraphStyle(
        'BodyP',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=SLATE_DARK
    )

    bullet_style = ParagraphStyle(
        'BulletP',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=SLATE_DARK,
        leftIndent=12
    )

    # 1. HEADER BANNER
    header_data = [
        [
            Paragraph("<b>PHARMACHEM GLOBAL MANUFACTURING & SUPPLY</b><br/><font size=7 color='#0891b2'>Active Pharmaceutical Ingredient (API) Manufacturing Operations — Cleanroom Unit 3</font>", value_style),
            Paragraph("<b>21 CFR PART 211 / EU GMP ANNEX 11</b><br/><font size=7 color='#be123c'><b>FORM QA-DEV-008 Rev. 04</b></font>", ParagraphStyle('HRight', parent=value_style, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=TURQUOISE_PRIMARY, spaceBefore=4, spaceAfter=8))

    # DOCUMENT TITLE BLOCK
    title_data = [
        [
            Paragraph("OOS DEVIATION & QUALITY INCIDENT INVESTIGATION REPORT", title_style),
            Paragraph("STATUS: <b>OPEN / UNDER RCA</b><br/>SEVERITY: <font color='#be123c'><b>CRITICAL (OOS)</b></font>", ParagraphStyle('StatusB', parent=value_style, alignment=2))
        ]
    ]
    title_table = Table(title_data, colWidths=[370, 170])
    title_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(title_table)
    story.append(Spacer(1, 4))

    # SECTION 1: INVESTIGATION METADATA & ORIGIN
    sec1_banner = Table([[Paragraph("SECTION 1: INCIDENT METADATA & INTAKE ORIGIN", section_header_style)]], colWidths=[540])
    sec1_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TURQUOISE_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec1_banner)

    sec1_data = [
        [
            Paragraph("<b>Deviation Tracking ID:</b>", label_style),
            Paragraph("<b>DEV-2026-0882</b>", value_bold_style),
            Paragraph("<b>Initiation Date:</b>", label_style),
            Paragraph("2026-10-18", value_style),
            Paragraph("<b>Discovery Date:</b>", label_style),
            Paragraph("2026-10-19", value_style)
        ],
        [
            Paragraph("<b>Lead Investigator:</b>", label_style),
            Paragraph("Dr. Arthur Vance (QA Lead)", value_style),
            Paragraph("<b>Department:</b>", label_style),
            Paragraph("Quality Assurance / QC API", value_style),
            Paragraph("<b>Intake Source:</b>", label_style),
            Paragraph("OOS Laboratory Notification", value_style)
        ]
    ]
    sec1_table = Table(sec1_data, colWidths=[100, 120, 80, 80, 80, 80])
    sec1_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, TURQUOISE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(sec1_table)
    story.append(Spacer(1, 8))

    # SECTION 2: PRODUCT & MANUFACTURING CONTEXT
    sec2_banner = Table([[Paragraph("SECTION 2: PRODUCT & API MANUFACTURING CONTEXT", section_header_style)]], colWidths=[540])
    sec2_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TURQUOISE_PRIMARY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec2_banner)

    sec2_data = [
        [
            Paragraph("<b>Active Substance:</b>", label_style),
            Paragraph("<b>Artemicort Micronized Bulk API (Intermediate)</b>", value_bold_style),
            Paragraph("<b>Batch / Lot ID:</b>", label_style),
            Paragraph("<b>ART-2026-042</b>", value_bold_style)
        ],
        [
            Paragraph("<b>Manufacturing Unit:</b>", label_style),
            Paragraph("Unit 3 Chemical Synthesis Cleanroom Bay 4", value_style),
            Paragraph("<b>Equipment Tag:</b>", label_style),
            Paragraph("Crystallizer Reactor CR-04 (2,500 L)", value_style)
        ],
        [
            Paragraph("<b>Unit Operation:</b>", label_style),
            Paragraph("Stage 3 Controlled Anti-Solvent Crystallization", value_style),
            Paragraph("<b>Affected Quantity:</b>", label_style),
            Paragraph("480.0 kg (16 fiber drums with dual LDPE)", value_style)
        ]
    ]
    sec2_table = Table(sec2_data, colWidths=[110, 200, 90, 140])
    sec2_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, TURQUOISE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(sec2_table)
    story.append(Spacer(1, 8))

    # SECTION 3: OUT-OF-SPECIFICATION (OOS) ANALYTICAL FINDINGS
    sec3_banner = Table([[Paragraph("SECTION 3: OUT-OF-SPECIFICATION (OOS) ANALYTICAL FINDINGS", section_header_style)]], colWidths=[540])
    sec3_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#991b1b")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec3_banner)

    oos_data = [
        [
            Paragraph("<b>Tested Parameter / Method</b>", label_style),
            Paragraph("<b>Registered Specification</b>", label_style),
            Paragraph("<b>Observed Lab Result</b>", label_style),
            Paragraph("<b>Delta / Disposition</b>", label_style)
        ],
        [
            Paragraph("<b>Unspecified Impurity at RRT 1.18</b><br/><font size=7 color='#64748b'>HPLC Assay Method STM-ART-204 Rev 03</font>", value_style),
            Paragraph("<b>NMT 0.10% (w/w)</b><br/><font size=7 color='#059669'>Standard Release Spec SPC-ART-004</font>", value_style),
            Paragraph("<b>0.28% (w/w)</b><br/><font size=7 color='#be123c'>Confirmatory re-test: 0.27%</font>", critical_style),
            Paragraph("<b>+0.18% EXCEEDANCE</b><br/><font size=7 color='#be123c'>CONFIRMED OUT-OF-SPECIFICATION</font>", critical_style)
        ],
        [
            Paragraph("<b>Total Related Substances</b><br/><font size=7 color='#64748b'>HPLC Sum of Impurities</font>", value_style),
            Paragraph("<b>NMT 0.50% (w/w)</b><br/><font size=7 color='#059669'>Standard Release Spec SPC-ART-004</font>", value_style),
            Paragraph("<b>0.62% (w/w)</b><br/><font size=7 color='#be123c'>Individual + Related</font>", critical_style),
            Paragraph("<b>+0.12% EXCEEDANCE</b><br/><font size=7 color='#be123c'>OOS — REJECT RECOMMENDED</font>", critical_style)
        ]
    ]
    oos_table = Table(oos_data, colWidths=[170, 130, 110, 130])
    oos_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#fee2e2")),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fca5a5")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(oos_table)
    story.append(Spacer(1, 8))

    # SECTION 4: PROCESS DEVIATION & TIMELINE OF EVENTS
    sec4_banner = Table([[Paragraph("SECTION 4: CHRONOLOGICAL TIMELINE & PROCESS ANOMALY DESCRIPTION", section_header_style)]], colWidths=[540])
    sec4_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TURQUOISE_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec4_banner)

    narrative_p1 = Paragraph(
        "<b>Incident Narrative:</b> On 2026-10-18 at 14:15 IST, Quality Control released finished testing results for bulk batch ART-2026-042. HPLC chromatographic assay identified an elevated unspecified peak at Relative Retention Time (RRT) 1.18 measuring 0.28% (w/w), exceeding the registered release limit of 0.10%. Total impurities also breached specification at 0.62% (limit <= 0.50%). Phase I laboratory investigation ruled out analytical instrumentation failure, column deterioration, or weighing errors through double independent injection.",
        body_style
    )

    narrative_p2 = Paragraph(
        "<b>Manufacturing Deviation Sequence:</b> Cross-referencing batch production records (BPR-ART-042) revealed that during Stage 3 crystallization at 02:40 IST on 2026-10-17, secondary chiller unit CH-02 experienced an intermittent flow valve alarm (AL-CH-309). Coolant flow rate into the CR-04 reactor jacket plummeted from 45.0 L/min to 8.2 L/min. As a consequence, reactor temperature plateaued at 44.5°C for approximately 85 minutes, interrupting the programmed cooling curve (68.0°C to 12.0°C over 6.0 hours). Extended thermal exposure under agitation (65 RPM) at 44.5°C provided sufficient activation energy to drive dimerization into the RRT 1.18 degradation product.",
        body_style
    )

    narrative_table = Table([[narrative_p1], [narrative_p2]], colWidths=[540])
    narrative_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, TURQUOISE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(narrative_table)
    story.append(Spacer(1, 8))

    # SECTION 5: IMMEDIATE CONTAINMENT ACTIONS TAKEN (21 CFR 211.192)
    sec5_banner = Table([[Paragraph("SECTION 5: IMMEDIATE CONTAINMENT ACTIONS EXECUTED", section_header_style)]], colWidths=[540])
    sec5_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TURQUOISE_PRIMARY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec5_banner)

    containment_data = [
        [
            Paragraph("<b>#</b>", label_style),
            Paragraph("<b>Containment Action Item</b>", label_style),
            Paragraph("<b>Responsible Role</b>", label_style),
            Paragraph("<b>Verification / Status</b>", label_style)
        ],
        [
            Paragraph("1", value_bold_style),
            Paragraph("SAP Quality Quarantine status applied (Block Code Q-400). Electronic transfer locked.", value_style),
            Paragraph("QA Materials Officer", value_style),
            Paragraph("<font color='#059669'><b>COMPLETED (SAP ID #9921)</b></font>", value_style)
        ],
        [
            Paragraph("2", value_bold_style),
            Paragraph("All 16 fiber drums physically quarantined in Warehouse Bay 3B with serialized red security tags (Tags #Q-042-01 through 16).", value_style),
            Paragraph("Warehouse Lead", value_style),
            Paragraph("<font color='#059669'><b>COMPLETED (Verified Bay 3B)</b></font>", value_style)
        ],
        [
            Paragraph("3", value_bold_style),
            Paragraph("Crystallizer CR-04 tagged out of service (LOTO Tag #CR04-2026-88) pending mechanical chiller inspection.", value_style),
            Paragraph("Maintenance Supervisor", value_style),
            Paragraph("<font color='#059669'><b>COMPLETED (LOTO Active)</b></font>", value_style)
        ]
    ]
    containment_table = Table(containment_data, colWidths=[20, 290, 110, 120])
    containment_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), TURQUOISE_LIGHT),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, TURQUOISE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(containment_table)
    story.append(Spacer(1, 8))

    # SECTION 6: UNRESOLVED EVIDENCE GAPS & MISSING AUDIT RECORDS
    sec6_banner = Table([[Paragraph("SECTION 6: UNRESOLVED EVIDENCE GAPS & PENDING AUDIT RECORDS", section_header_style)]], colWidths=[540])
    sec6_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#d97706")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec6_banner)

    gap_data = [
        [
            Paragraph("<b>Record Category</b>", label_style),
            Paragraph("<b>Specific Missing Evidence / Unresolved Question</b>", label_style),
            Paragraph("<b>Investigation Impact</b>", label_style)
        ],
        [
            Paragraph("<b>SCADA Historian</b>", value_bold_style),
            Paragraph("Continuous 1-second temperature and agitator motor torque logs for Crystallizer CR-04 between 01:00 and 06:00 IST pending retrieval from archive server.", value_style),
            Paragraph("Crucial to verify exact thermal plateau duration and cooling kinetics.", value_style)
        ],
        [
            Paragraph("<b>Metrology Audit</b>", value_bold_style),
            Paragraph("Dual-RTD Sensor TT-204 calibration certificate and Coolant Flow Transmitter FT-309 drift history pending review.", value_style),
            Paragraph("Required to rule out thermal sensing drift during crystallization.", value_style)
        ],
        [
            Paragraph("<b>Raw Material CoA</b>", value_bold_style),
            Paragraph("Supplier Certificate of Analysis for Reagent Grade Isopropanol (Lot IPA-8839) not yet verified for trace peroxides.", value_style),
            Paragraph("Ensures solvent oxidation impurities did not seed the RRT 1.18 degradation.", value_style)
        ],
        [
            Paragraph("<b>Operator Logbook</b>", value_bold_style),
            Paragraph("Night Shift B operator logbook entry regarding technician response time to Alarm AL-CH-309.", value_style),
            Paragraph("Determines why manual override was delayed by 85 minutes.", value_style)
        ]
    ]
    gap_table = Table(gap_data, colWidths=[100, 270, 170])
    gap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#fef3c7")),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fde68a")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(gap_table)
    story.append(Spacer(1, 10))

    # SECTION 7: REGULATORY MANDATE & QA SIGNATURE BLOCK
    sign_data = [
        [
            Paragraph("<b>Prepared by (Lead Investigator):</b><br/><u>Dr. Arthur Vance, QA Senior Specialist</u><br/>Date: 2026-10-19 | Emp ID: QA-4091", value_style),
            Paragraph("<b>Reviewed by (QC Lab Director):</b><br/><u>Dr. Elena Rostova, VP Analytical Science</u><br/>Date: 2026-10-19 | Emp ID: QC-1022", value_style),
            Paragraph("<b>Concurrence (Manufacturing Head):</b><br/><u>Marcus Thorne, P.Eng., Operations Director</u><br/>Date: 2026-10-19 | Emp ID: PR-8823", value_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[180, 180, 180])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, TURQUOISE_DARK),
        ('LINEBEFORE', (1,0), (1,-1), 0.5, TURQUOISE_BORDER),
        ('LINEBEFORE', (2,0), (2,-1), 0.5, TURQUOISE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 6))

    # Compliance footer
    footer_text = Paragraph(
        "<font size=6.5 color='#64748b'>CONFIDENTIAL & PROPRIETARY — PHARMACHEM GLOBAL API MANUFACTURING. Generated under 21 CFR Part 11 Electronic Records and EU GMP Annex 11. All data integrity controls active. For internal QA Root Cause Analysis and Regulatory Inspection only.</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)
    )
    story.append(footer_text)

    # Build the document
    doc.build(story)
    print(f"Successfully generated incident report PDF at: {output_path}")

if __name__ == "__main__":
    out1 = "c:/Users/Vishal S Naik/MyProjects/ORYVEX/incident_report_ART-2026-042.pdf"
    out2 = "c:/Users/Vishal S Naik/MyProjects/ORYVEX/frontend/public/incident_report_ART-2026-042.pdf"
    create_pharmaceutical_incident_pdf(out1)
    create_pharmaceutical_incident_pdf(out2)
