import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { useAuthContext } from "../hooks/useAuthContext";
import html2canvas from 'html2canvas';

// Enhanced Logo Component
const Logo = () => (
  <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f9fa"/>
    <text x="50%" y="40%" fontFamily="Montserrat" fontSize="40" fontWeight="bold" fill="#2c3e50" textAnchor="middle">E-Shop</text>
    <path d="M50 70 H150 L170 130 H40 Z" fill="#3498db" stroke="#2c3e50" strokeWidth="5"/>
    <circle cx="60" cy="140" r="10" fill="#2c3e50"/>
    <circle cx="150" cy="140" r="10" fill="#2c3e50"/>
  </svg>
);

const Receipt = ({ purchase }) => {
  const { user } = useAuthContext();
  const receiptRef = useRef(null);
  const qrCodeRef = useRef(null);

  const downloadAsImage = async () => {
    const element = receiptRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = `receipt-${purchase.orderId || purchase._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadClientPDF = async () => {
    const doc = new jsPDF();
    
    // Add custom fonts
    doc.setFont("helvetica", "bold");
    
    // Add header with improved styling
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 210, 297, "F");
    
    doc.setFontSize(28);
    doc.setTextColor(44, 62, 80);
    doc.text('E-Shop Store', 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text('Your One-Stop Shopping Destination', 20, 40);

    // Add order details in a table format
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);
    
    doc.setFontSize(12);
    doc.text(`Order ID: ${purchase.orderId || purchase._id}`, 20, 60);
    doc.text(`Date: ${new Date(purchase.createdAt).toLocaleString()}`, 20, 70);
    doc.text(`Email: ${purchase.email || 'N/A'}`, 20, 80);

    // Create table headers
    doc.setFillColor(52, 152, 219);
    doc.rect(20, 90, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Item", 25, 97);
    doc.text("Quantity", 100, 97);
    doc.text("Price", 160, 97);
    
    // Add items in table format
    let yPos = 105;
    doc.setTextColor(44, 62, 80);
    purchase.items?.forEach((item) => {
      doc.text(item.name, 25, yPos);
      doc.text(`${item.quantity}`, 105, yPos);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 160, yPos);
      yPos += 10;
    });

    // Add totals with improved styling
    yPos += 10;
    doc.setDrawColor(52, 152, 219);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.text("Subtotal:", 120, yPos);
    doc.text(`$${(purchase.subtotal || 0).toFixed(2)}`, 160, yPos);
    yPos += 10;
    doc.text("Tax:", 120, yPos);
    doc.text(`$${(purchase.tax || 0).toFixed(2)}`, 160, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Total:", 120, yPos);
    doc.text(`$${(purchase.total || 0).toFixed(2)}`, 160, yPos);

    // Add QR code with pure white background and maintain aspect ratio
    const qrCanvas = await html2canvas(qrCodeRef.current, {
      scale: 4,
      backgroundColor: '#FFFFFF',
      logging: false,
      useCORS: true,
      width: 128,
      height: 128
    });
    const qrCodeImage = qrCanvas.toDataURL('image/png', 1.0);
    doc.addImage(qrCodeImage, 'PNG', 20, 180, 50, 50, undefined, 'FAST');

    // Add styled footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(52, 152, 219);
    doc.text('Thank you for shopping with E-Shop!', 20, 250);
    doc.text('Visit us again at www.eshop.com', 20, 260);

    // Save the PDF
    doc.save(`receipt-${purchase.orderId || purchase._id}.pdf`);
  };

  return (
    <div className="min-h-screen flex justify-start items-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div ref={receiptRef} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
        <div className="text-left mb-8">
          <div className="mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 font-montserrat">E-Shop Store</h1>
          <p className="text-gray-600 text-md">Your One-Stop Shopping Destination</p>
        </div>

        <div className="space-y-6">
          <div className="border-b border-blue-200 pb-4">
            <p className="font-semibold text-lg">Order ID: {purchase.orderId || purchase._id}</p>
            <p className="text-gray-600">
              {new Date(purchase.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-600 text-white p-3 rounded-t-lg grid grid-cols-3 font-semibold">
              <span>Item</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Price</span>
            </div>
            <div className="bg-gray-50 rounded-b-lg p-4 space-y-3">
              {purchase.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-3 text-gray-700">
                  <span>{item.name}</span>
                  <span className="text-center">x{item.quantity}</span>
                  <span className="text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-blue-200 pt-4 mt-4">
            <div className="flex justify-between text-xl font-bold text-blue-800">
              <span>Total:</span>
              <span>${(purchase.total || 0).toFixed(2)}</span>
            </div>
          </div>

          <div ref={qrCodeRef} className="mt-4 bg-white" style={{width: '128px', height: '128px'}}>
            <QRCodeSVG
              value={`Order ID: ${purchase.orderId || purchase._id}\nTotal: $${purchase.total}\nDate: ${new Date(purchase.createdAt).toLocaleString()}`}
              size={128}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={downloadClientPDF}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
          >
            Download PDF
          </button>
          <button
            onClick={downloadAsImage}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
          >
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;