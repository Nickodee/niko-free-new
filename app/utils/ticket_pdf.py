"""
Ticket PDF Generator with Niko Free branding
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
import os
import requests
from flask import current_app
from PIL import Image as PILImage
import io

# Company theme colors
COMPANY_BLUE = "#27aae2"
COMPANY_BLUE_DARK = "#1e8bb8"
COMPANY_BLACK = "#333333"
COMPANY_WHITE = "#ffffff"
COMPANY_BG_LIGHT = "#f5f5f5"


def _get_logo_path():
    """Get Niko Free logo path"""
    # Try multiple possible locations
    possible_paths = []
    
    # From app/utils/ticket_pdf.py -> project root -> niko-free-new/src/images/
    ticket_pdf_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(ticket_pdf_dir)
    project_root = os.path.dirname(os.path.dirname(app_dir))
    possible_paths.append(os.path.join(project_root, 'niko-free-new', 'src', 'images', 'Niko Free Logo.png'))
    possible_paths.append(os.path.join(project_root, 'niko-free-new', 'src', 'images', 'Niko Free-Logo.png'))
    
    # From current working directory
    possible_paths.append(os.path.join(os.getcwd(), 'niko-free-new', 'src', 'images', 'Niko Free Logo.png'))
    possible_paths.append(os.path.join(os.getcwd(), 'src', 'images', 'Niko Free Logo.png'))
    
    # Relative paths
    possible_paths.append('niko-free-new/src/images/Niko Free Logo.png')
    possible_paths.append('src/images/Niko Free Logo.png')
    
    for path in possible_paths:
        abs_path = os.path.abspath(path) if not os.path.isabs(path) else path
        if os.path.exists(abs_path):
            return abs_path
    
    return None


def _get_image_path(image_path, upload_folder='uploads'):
    """Helper function to resolve image paths - handles Azure Blob Storage URLs"""
    if not image_path:
        return None
    
    # If it's an Azure Blob Storage URL, return it as-is (will download later)
    if image_path.startswith('http://') or image_path.startswith('https://'):
        return image_path
    
    # Handle different path formats for local files
    if image_path.startswith('/uploads/'):
        image_path = image_path[1:]
    elif image_path.startswith('uploads/'):
        pass
    elif not os.path.isabs(image_path):
        image_path = f"uploads/{image_path}"
    
    # Build absolute path
    try:
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    except RuntimeError:
        upload_folder = 'uploads'
    
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Construct full path
    if os.path.isabs(upload_folder):
        if image_path.startswith('uploads/'):
            full_path = os.path.join(upload_folder, image_path.replace('uploads/', '', 1))
        else:
            full_path = os.path.join(upload_folder, image_path)
    else:
        full_path = os.path.join(project_root, image_path)
    
    # Normalize path
    full_path = os.path.normpath(full_path)
    
    # Check if file exists
    if os.path.exists(full_path):
        return full_path
    
    # Try alternative paths
    filename = os.path.basename(full_path)
    alt_paths = [
        os.path.join(project_root, 'uploads', filename),
        os.path.join(upload_folder, filename) if not os.path.isabs(upload_folder) else os.path.join(upload_folder, filename),
    ]
    
    for alt_path in alt_paths:
        alt_path = os.path.normpath(alt_path)
        if os.path.exists(alt_path):
            return alt_path
    
    return None


def _download_image_from_url(url, max_size=(2.5*72, 3.5*72)):
    """Download image from URL (Azure Blob Storage) and return as BytesIO"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Open with PIL to handle resizing while preserving aspect ratio
        img = PILImage.open(io.BytesIO(response.content))
        
        # Calculate dimensions preserving aspect ratio
        img_width, img_height = img.size
        max_width, max_height = max_size
        
        # Calculate scaling factor to fit within max dimensions
        width_ratio = max_width / img_width
        height_ratio = max_height / img_height
        scale_factor = min(width_ratio, height_ratio)
        
        # Resize preserving aspect ratio
        new_width = int(img_width * scale_factor)
        new_height = int(img_height * scale_factor)
        
        img = img.resize((new_width, new_height), PILImage.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save to BytesIO
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG', quality=85)
        img_bytes.seek(0)
        
        return img_bytes
    except Exception as e:
        print(f"⚠️ [PDF] Error downloading image from URL: {e}")
        return None


def generate_ticket_pdf(booking, tickets):
    """
    Generate PDF ticket with QR code in a modern 3-column layout
    Left: Event poster, Middle: Ticket info, Right: QR code
    Includes Niko Free branding with theme colors
    
    Args:
        booking: Booking object
        tickets: List of Ticket objects
        
    Returns:
        BytesIO: PDF file as BytesIO object
    """
    buffer = BytesIO()
    
    # Create PDF document with minimal margins for ticket layout
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.3*inch,
        leftMargin=0.3*inch,
        topMargin=0.5*inch,  # Increased for header
        bottomMargin=0.5*inch  # Increased for footer
    )
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Header style with company colors
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor(COMPANY_WHITE),
        alignment=TA_CENTER,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    # Disclaimer style (top of ticket)
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER,
        spaceAfter=15,
        fontName='Helvetica'
    )
    
    # Event title style
    event_title_style = ParagraphStyle(
        'EventTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor(COMPANY_BLACK),
        spaceAfter=8,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold'
    )
    
    # Label style (for field labels)
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        alignment=TA_LEFT,
        spaceAfter=2,
        fontName='Helvetica'
    )
    
    # Value style (for field values)
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor(COMPANY_BLACK),
        alignment=TA_LEFT,
        spaceAfter=10,
        fontName='Helvetica'
    )
    
    # Ticket number style
    ticket_num_style = ParagraphStyle(
        'TicketNumber',
        parent=styles['Heading2'],
        fontSize=20,
        textColor=colors.HexColor(COMPANY_BLUE),
        alignment=TA_CENTER,
        spaceAfter=5,
        fontName='Helvetica-Bold'
    )
    
    # Footer style with company colors
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor(COMPANY_WHITE),
        alignment=TA_CENTER,
        spaceBefore=10,
        fontName='Helvetica'
    )
    
    # Header with logo and company colors
    logo_path = _get_logo_path()
    header_cell = []
    
    if logo_path and os.path.exists(logo_path):
        try:
            logo_img = Image(logo_path, width=1.5*inch, height=0.5*inch, kind='proportional')
            logo_img.hAlign = 'CENTER'
            header_cell.append(logo_img)
        except Exception as e:
            print(f"⚠️ [PDF] Error loading logo: {e}")
            header_cell.append(Paragraph("<b>NIKO FREE</b>", header_style))
    else:
        header_cell.append(Paragraph("<b>NIKO FREE</b>", header_style))
    
    # Create header table with gradient background
    header_table = Table(
        [[header_cell]],
        colWidths=[8.4*inch],
        rowHeights=[0.6*inch]
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(COMPANY_BLUE)),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.1*inch))
    
    # Disclaimer at top
    elements.append(Paragraph("This ticket must be presented for admittance to the event.", disclaimer_style))
    elements.append(Spacer(1, 0.1*inch))
    
    event = booking.event
    user = booking.user
    
    # Process each ticket
    for idx, ticket in enumerate(tickets, 1):
        if idx > 1:
            elements.append(Spacer(1, 0.3*inch))
            elements.append(Paragraph("─" * 80, disclaimer_style))
            elements.append(Spacer(1, 0.3*inch))
        
        # Get event poster image path (handles Azure URLs)
        poster_path = None
        poster_url = None
        if event.poster_image:
            if event.poster_image.startswith('http://') or event.poster_image.startswith('https://'):
                poster_url = event.poster_image
            else:
                poster_path = _get_image_path(event.poster_image)
        
        # Get QR code image path
        qr_path = None
        if ticket.qr_code:
            qr_path = _get_image_path(ticket.qr_code)
        
        # Prepare ticket data
        start_date = event.start_date
        date_str = start_date.strftime('%B %d, %Y')
        start_time_str = start_date.strftime('%H:%M')
        
        end_time_str = None
        if event.end_date:
            end_time_str = event.end_date.strftime('%H:%M')
        
        venue = event.venue_name or event.venue_address or "Online Event"
        ticket_type_name = ticket.ticket_type.name if ticket.ticket_type else "General Admission"
        price_display = f"{float(booking.total_amount):,.2f} KSh" if booking.total_amount > 0 else "Free"
        order_date = booking.created_at.strftime('%d/%m/%Y %H:%M') if booking.created_at else ""
        
        # Build three-column table
        # Column 1: Event Poster (Left) - Don't stretch, preserve aspect ratio
        poster_cell = []
        if poster_url:
            # Download from Azure Blob Storage
            try:
                img_bytes = _download_image_from_url(poster_url, max_size=(2.5*72, 3.5*72))
                if img_bytes:
                    # Use kind='proportional' to preserve aspect ratio and prevent stretching
                    poster_img = Image(img_bytes, width=2.5*inch, height=3.5*inch, kind='proportional')
                    poster_img.hAlign = 'CENTER'
                    poster_cell.append(poster_img)
                else:
                    poster_cell.append(Paragraph("<i>Event Image</i>", label_style))
            except Exception as e:
                print(f"⚠️ [PDF] Error loading poster from URL: {e}")
                poster_cell.append(Paragraph("<i>Event Image</i>", label_style))
        elif poster_path and os.path.exists(poster_path):
            try:
                # Use kind='proportional' to preserve aspect ratio and prevent stretching
                poster_img = Image(poster_path, width=2.5*inch, height=3.5*inch, kind='proportional')
                poster_img.hAlign = 'CENTER'
                poster_cell.append(poster_img)
            except Exception as e:
                print(f"⚠️ [PDF] Error loading poster image: {e}")
                poster_cell.append(Paragraph("<i>Event Image</i>", label_style))
        else:
            poster_cell.append(Paragraph("<i>Event Image</i>", label_style))
        
        # Column 2: Ticket Information (Middle)
        info_cell = []
        info_cell.append(Paragraph(f"<b>Event Ticket For:</b>", label_style))
        info_cell.append(Paragraph(f"<b>{event.title}</b>", event_title_style))
        info_cell.append(Spacer(1, 0.15*inch))
        info_cell.append(Paragraph(f"<b>Start:</b> {date_str} at {start_time_str}", value_style))
        if end_time_str:
            info_cell.append(Paragraph(f"<b>End:</b> {event.end_date.strftime('%B %d, %Y')} at {end_time_str}", value_style))
        info_cell.append(Spacer(1, 0.1*inch))
        info_cell.append(Paragraph(f"<b>Venue:</b> {venue}", value_style))
        info_cell.append(Spacer(1, 0.1*inch))
        order_ref_para = Paragraph(
            f"<b>Ticket Order Ref:</b> {booking.booking_number}",
            ParagraphStyle('OrderRef', parent=value_style, alignment=TA_RIGHT)
        )
        info_cell.append(order_ref_para)
        info_cell.append(Spacer(1, 0.1*inch))
        ticket_type_para = Paragraph(f"<b>Ticket Type:</b> {ticket_type_name}", value_style)
        info_cell.append(ticket_type_para)
        price_para = Paragraph(
            f"<b>Price:</b> {price_display}",
            ParagraphStyle('Price', parent=value_style, alignment=TA_RIGHT)
        )
        info_cell.append(price_para)
        info_cell.append(Spacer(1, 0.1*inch))
        purchaser_name = f"{user.first_name} {user.last_name}".strip()
        info_cell.append(Paragraph(f"<b>Purchased by:</b> {purchaser_name}", value_style))
        order_date_para = Paragraph(
            f"<b>Order Date:</b> {order_date}",
            ParagraphStyle('OrderDate', parent=value_style, alignment=TA_RIGHT)
        )
        info_cell.append(order_date_para)
        
        # Column 3: QR Code (Right)
        qr_cell = []
        if qr_path and os.path.exists(qr_path):
            try:
                qr_img = Image(qr_path, width=2.2*inch, height=2.2*inch)
                qr_img.hAlign = 'CENTER'
                qr_cell.append(qr_img)
                qr_cell.append(Spacer(1, 0.1*inch))
                qr_cell.append(Paragraph("<b>Ticket No:</b>", label_style))
                qr_cell.append(Paragraph(f"<b>#{ticket.ticket_number}</b>", ticket_num_style))
            except Exception as e:
                print(f"⚠️ [PDF] Error loading QR code: {e}")
                qr_cell.append(Paragraph("QR Code", label_style))
                qr_cell.append(Paragraph(f"<b>#{ticket.ticket_number}</b>", ticket_num_style))
        else:
            qr_cell.append(Paragraph("QR Code", label_style))
            qr_cell.append(Paragraph(f"<b>#{ticket.ticket_number}</b>", ticket_num_style))
        
        # Create table with three columns
        ticket_table = Table(
            [[poster_cell, info_cell, qr_cell]],
            colWidths=[2.8*inch, 3.5*inch, 2.5*inch],
            rowHeights=[4*inch]
        )
        
        # Style the table
        ticket_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('ALIGN', (2, 0), (2, 0), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor(COMPANY_BG_LIGHT)),
            ('BACKGROUND', (1, 0), (1, 0), colors.white),
            ('BACKGROUND', (2, 0), (2, 0), colors.HexColor(COMPANY_BG_LIGHT)),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
        ]))
        
        elements.append(ticket_table)
    
    # Footer with company colors
    elements.append(Spacer(1, 0.2*inch))
    
    # Footer table with gradient background
    footer_content = [
        Paragraph("Thank you for using Niko Free!", footer_style),
        Paragraph("Present this ticket or QR code at the event entrance", footer_style),
        Paragraph("For support, contact: support@niko-free.com", footer_style)
    ]
    
    footer_table = Table(
        [[footer_content]],
        colWidths=[8.4*inch],
        rowHeights=[0.8*inch]
    )
    footer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(COMPANY_BLUE_DARK)),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(footer_table)
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF data
    buffer.seek(0)
    return buffer


def generate_ticket_pdf_file(booking, tickets, output_path):
    """
    Generate PDF ticket and save to file
    
    Args:
        booking: Booking object
        tickets: List of Ticket objects
        output_path: Path to save PDF file
        
    Returns:
        str: Path to saved PDF file
    """
    pdf_buffer = generate_ticket_pdf(booking, tickets)
    
    # Save to file
    with open(output_path, 'wb') as f:
        f.write(pdf_buffer.read())
    
    return output_path

