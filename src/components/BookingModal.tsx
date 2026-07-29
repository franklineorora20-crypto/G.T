import React, { useState } from 'react';
import { Order, OrderItem } from '../types';
import { X, Truck, CheckCircle2, Calendar, Clock, MapPin, Phone, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import { INITIAL_SERVICES } from '../data/initialData';
import { mapDbOrderToOrder } from '../lib/orders';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceName?: string;
  prefilledItems?: OrderItem[];
  prefilledTotal?: number;
  onOrderCreated: (newOrder: Order) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceName,
  prefilledItems,
  prefilledTotal,
  onOrderCreated
}) => {
  if (!isOpen) return null;

  // Step state: 1 = Details & Location, 2 = Date & Time, 3 = M-Pesa Payment Simulation & Confirmation
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('07');
  const [branch, setBranch] = useState<'Rongai Branch' | 'Ngong Branch'>('Rongai Branch');
  const [address, setAddress] = useState('');
  const [estatePreset, setEstatePreset] = useState('Rongai - Magadi Road');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('Morning (8:00 AM - 11:00 AM)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod'>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('07');

  const normalizePhoneNumber = (value: string) => String(value).trim().replace(/[^0-9]/g, '');
  const isValidMpesaNumber = (value: string) => {
    const digits = normalizePhoneNumber(value);
    return /^07\d{8}$/.test(digits) || /^2547\d{8}$/.test(digits);
  };

  // M-Pesa STK Push Simulation state
  const [stkState, setStkState] = useState<'idle' | 'sending' | 'prompted' | 'success'>('idle');

  // Selected Service items
  const [selectedServiceName, setSelectedServiceName] = useState<string>(
    preselectedServiceName || INITIAL_SERVICES[0].name
  );
  const [quantity, setQuantity] = useState<number>(5);

  const selectedService = INITIAL_SERVICES.find(s => s.name === selectedServiceName) || INITIAL_SERVICES[0];

  // Total price calculation
  let computedItems: OrderItem[] = [];
  let calculatedTotal = 0;

  if (prefilledItems && prefilledItems.length > 0 && prefilledTotal) {
    computedItems = prefilledItems;
    calculatedTotal = prefilledTotal;
  } else {
    computedItems = [
      {
        serviceName: `${selectedService.name} (${selectedService.priceUnit})`,
        quantity: quantity,
        unitPrice: selectedService.price
      }
    ];
    calculatedTotal = quantity * selectedService.price;
  }

  // Pre-set common local estates
  const commonEstates = [
    'Rongai - Magadi Road',
    'Rongai - Hill Valley Place',
    'Rongai - Rimpa Estate',
    'Rongai - Kiserian Junction',
    'Ngong - Country Arcade',
    'Ngong - Matasia',
    'Ngong - Olkeri',
    'Karen / Kuwinda',
    'Langata / Uhuru Gardens',
    'Kilimani / Lavington'
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!phone || !isValidMpesaNumber(phone)) {
      alert('Please enter a valid phone number (07XXXXXXXX or 2547XXXXXXXX).');
      return;
    }
    if (step === 1) {
      setMpesaNumber(phone);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const [bookingError, setBookingError] = useState<string>('');

  const handleConfirmAndPay = async () => {
    if (paymentMethod === 'mpesa') {
      setBookingError('');
      setStkState('sending');

      const fullAddressText = `${estatePreset}, ${address || 'Near landmark'}`;
      const payload = {
        customerName,
        email: email || undefined,
        phone: mpesaNumber,
        branch,
        address: fullAddressText,
        items: computedItems,
        totalPrice: calculatedTotal,
        pickupDate,
        timeSlot,
        specialNotes: specialNotes || 'Handle with Goldtribe standard care.',
        deliveryType: 'Delivery to Door',
      };

      try {
        const response = await fetch('/api/stkpush', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        let data: any = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: text };
          }
        }

        if (!response.ok) {
          throw new Error(data.error || data.raw || 'Unable to initiate M-Pesa payment.');
        }

        const createdOrder = data.order;
        if (!createdOrder) {
          throw new Error('Missing created order from STK push response.');
        }

        setStkState('prompted');
        const newOrder = mapDbOrderToOrder(createdOrder);
        onOrderCreated(newOrder);
        onClose();
        return;
      } catch (error: any) {
        console.error('STK Push failed:', error);
        setBookingError(error?.message || 'M-Pesa request failed.');
        setStkState('idle');
        return;
      }
    }

    await completeOrderCreation('Pay on Delivery');
  };

  const completeOrderCreation = async (payStatus: 'Paid via M-Pesa' | 'Pay on Delivery', refCode?: string) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderId = `GL-${randomDigits}`;
    const fullAddressText = `${estatePreset}, ${address || 'Near landmark'}`;

    const newOrder: Order = {
      id: orderId,
      customerName,
      email: email || undefined,
      phone,
      branch,
      address: fullAddressText,
      items: computedItems,
      totalPrice: calculatedTotal,
      status: 'Order Received',
      createdAt: 'Just now',
      estimatedDelivery: 'Within 24 Hours',
      paymentStatus: payStatus,
      mpesaRef: refCode,
      deliveryType: 'Delivery to Door',
      specialNotes: specialNotes || 'Handle with Goldtribe standard care.',
      trackingNotes: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Pickup booked for ${pickupDate} (${timeSlot}) at ${fullAddressText}. Express Rider assigned.`,
          status: 'Order Received',
        },
      ],
    };

  try {
  const { data, error } = await supabase
    .from("Orders")
    .insert([
      {
        tracking_id: newOrder.id,
        customerName: newOrder.customerName,
        email: newOrder.email,
        phone: newOrder.phone,
        branch: newOrder.branch,
        address: newOrder.address,
        items: newOrder.items,
        totalPrice: newOrder.totalPrice,
        status: newOrder.status,
        created_at: new Date().toISOString(),
        estimatedDelivery: newOrder.estimatedDelivery,
        paymentStatus: newOrder.paymentStatus,
        mpesaRef: newOrder.mpesaRef ?? null,
        deliveryType: newOrder.deliveryType,
        specialNotes: newOrder.specialNotes,
        trackingNotes: newOrder.trackingNotes,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  const formattedOrder = mapDbOrderToOrder(
    data as Record<string, unknown>
  );

  onOrderCreated(formattedOrder);

  setBookingError("");
  setStkState("idle");
  onClose();

} catch (err: any) {
  console.error(err);

  setBookingError(
    err?.message || "Unable to create order."
  );

  setStkState("idle");
}
  

    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-[#1c1b1b] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e5e2e1] space-y-6 animate-bounce-in relative my-8">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-[#e5e2e1] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fed65b]/30 text-[#745c00] font-bold text-xs font-manrope">
              <Truck className="w-3.5 h-3.5 text-[#341168]" />
              <span>Free Pickup for Orders &gt; Ksh 1,500</span>
            </div>
            <h3 className="text-2xl font-extrabold font-manrope text-[#341168] mt-1">
              Book Doorstep Collection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7b7581] hover:text-[#1c1b1b] rounded-full hover:bg-[#f6f3f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-manrope font-bold">
          <div className={`p-2 rounded-xl transition-all ${step >= 1 ? 'bg-[#341168] text-white' : 'bg-[#f6f3f2] text-[#7b7581]'}`}>
            1. Details & Location
          </div>
          <div className={`p-2 rounded-xl transition-all ${step >= 2 ? 'bg-[#341168] text-white' : 'bg-[#f6f3f2] text-[#7b7581]'}`}>
            2. Schedule Slot
          </div>
          <div className={`p-2 rounded-xl transition-all ${step >= 3 ? 'bg-[#341168] text-white' : 'bg-[#f6f3f2] text-[#7b7581]'}`}>
            3. Payment & Submit
          </div>
        </div>

        {/* Step 1: Customer Details & Service Selection */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4 font-worksans">
            {!prefilledItems && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#341168] block font-manrope">Select Primary Service</label>
                <select
                  value={selectedServiceName}
                  onChange={(e) => setSelectedServiceName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:outline-none focus:ring-2 focus:ring-[#341168]"
                >
                  {INITIAL_SERVICES.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} — Ksh {s.price} ({s.priceUnit})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-[#4a4550]">Quantity / Weight:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 p-2 rounded-xl border border-[#e5e2e1] text-center font-bold text-sm"
                  />
                  <span className="text-xs text-[#7b7581] font-bold">{selectedService.priceUnit}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Njoroge"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Phone Number (M-Pesa) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. david@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Select Servicing Branch</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBranch('Rongai Branch')}
                  className={`p-3 rounded-2xl border text-xs font-bold font-manrope transition-all cursor-pointer ${
                    branch === 'Rongai Branch'
                      ? 'bg-[#341168] text-white border-[#341168] shadow-md'
                      : 'bg-[#f6f3f2] text-[#4a4550] border-[#e5e2e1]'
                  }`}
                >
                  Rongai Hub (Magadi Rd)
                </button>

                <button
                  type="button"
                  onClick={() => setBranch('Ngong Branch')}
                  className={`p-3 rounded-2xl border text-xs font-bold font-manrope transition-all cursor-pointer ${
                    branch === 'Ngong Branch'
                      ? 'bg-[#341168] text-white border-[#341168] shadow-md'
                      : 'bg-[#f6f3f2] text-[#4a4550] border-[#e5e2e1]'
                  }`}
                >
                  Ngong Hub (Country Arcade)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Estate / Neighborhood</label>
              <select
                value={estatePreset}
                onChange={(e) => setEstatePreset(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
              >
                {commonEstates.map((est, i) => (
                  <option key={i} value={est}>{est}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">House / Apartment / House No.</label>
              <input
                type="text"
                placeholder="e.g. Hill Valley Apartments, House B4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#341168] text-white font-extrabold font-manrope text-sm hover:bg-[#4b2c7f] transition-colors cursor-pointer shadow-md"
            >
              Continue to Schedule Slot
            </button>
          </form>
        )}

        {/* Step 2: Pickup Schedule & Instructions */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4 font-worksans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Preferred Pickup Date</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
                >
                  <option value="Morning (8:00 AM - 11:00 AM)">Morning (8:00 AM - 11:00 AM)</option>
                  <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                  <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-1">
                Garment Care Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Heavy starch on shirt collars, extra lavender softener for duvet, check coat left pocket..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#e5e2e1] bg-[#f6f3f2] text-sm focus:ring-2 focus:ring-[#341168]"
              />
            </div>

            <div className="p-4 bg-[#f6f3f2] rounded-2xl border border-[#e5e2e1] space-y-2">
              <div className="text-xs font-bold font-manrope text-[#341168]">Summary of Order:</div>
              {computedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-worksans text-[#1c1b1b]">
                  <span>{item.serviceName} x{item.quantity}</span>
                  <span className="font-bold">Ksh {(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-[#e5e2e1] pt-2 flex justify-between font-bold text-sm font-manrope text-[#341168]">
                <span>Total Payable:</span>
                <span className="text-[#735c00]">Ksh {calculatedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-full border border-[#e5e2e1] text-xs font-bold font-manrope hover:bg-[#f6f3f2] cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-full bg-[#341168] text-white font-extrabold font-manrope text-sm hover:bg-[#4b2c7f] transition-colors cursor-pointer shadow-md"
              >
                Proceed to Payment
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Payment & Submit */}
        {step === 3 && (
          <div className="space-y-6 font-worksans">
            <div>
              <label className="text-xs font-bold text-[#341168] block font-manrope mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'mpesa'
                      ? 'bg-[#341168] text-white border-[#341168] shadow-md'
                      : 'bg-[#f6f3f2] text-[#4a4550] border-[#e5e2e1]'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#fed65b]" />
                  <span className="text-xs font-bold font-manrope">M-Pesa STK Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-[#341168] text-white border-[#341168] shadow-md'
                      : 'bg-[#f6f3f2] text-[#4a4550] border-[#e5e2e1]'
                  }`}
                >
                  <Truck className="w-6 h-6 text-[#fed65b]" />
                  <span className="text-xs font-bold font-manrope">Pay on Delivery</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-900 font-manrope flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  M-Pesa Express Payment Prompt
                </div>
                <p className="text-xs text-emerald-800">
                  An M-Pesa PIN prompt for <strong className="font-bold">Ksh {calculatedTotal.toLocaleString()}</strong> will be sent directly to your phone.
                </p>

                <div>
                  <label className="text-xs font-bold text-emerald-900 block font-manrope mb-1">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white text-sm font-bold text-emerald-950 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STK Push Simulation Status Feedback */}
            {bookingError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {bookingError}
              </div>
            )}
            {stkState !== 'idle' && (
              <div className="p-4 bg-[#341168] text-white rounded-2xl text-center space-y-2 animate-fade-in">
                {stkState === 'sending' && (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold font-manrope text-[#fed65b]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initiating M-Pesa Express STK Push...</span>
                  </div>
                )}
                {stkState === 'prompted' && (
                  <div className="text-xs font-bold text-[#fed65b] font-manrope">
                    📲 M-Pesa Prompt sent to {mpesaNumber}! Enter PIN on phone to complete.
                  </div>
                )}
                {stkState === 'success' && (
                  <div className="text-xs font-bold text-emerald-300 font-manrope flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>M-Pesa Payment Confirmed! Generating Order...</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={stkState !== 'idle'}
                className="py-3 px-5 rounded-full border border-[#e5e2e1] text-xs font-bold font-manrope hover:bg-[#f6f3f2] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={stkState !== 'idle'}
                className="flex-1 py-4 rounded-full bg-[#fed65b] text-[#341168] font-extrabold font-manrope text-sm hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {paymentMethod === 'mpesa' ? 'Send M-Pesa Prompt & Book' : 'Confirm Order & Pay on Delivery'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
