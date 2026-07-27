export type PageType = 'home' | 'services' | 'calculator' | 'track' | 'memberships' | 'branches' | 'faq' | 'all';

export type ServiceCategory = 'all' | 'laundry' | 'dry-cleaning' | 'duvet-clinic' | 'carpet-cleaning' | 'janitorial';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  priceUnit: string; // e.g., 'per kg', 'per piece', 'per sq meter', 'per room'
  turnaround: string; // e.g., '24 Hours', 'Same Day', '48 Hours'
  description: string;
  image?: string;
  popular?: boolean;
  features: string[];
}

export type OrderStatus = 
  | 'Order Received'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'Washing'
  | 'Drying'
  | 'Ironing'
  | 'Quality Check'
  | 'Ready for Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Inspection & Sorting'
  | 'In Wash & Revitalizing'
  | 'Ready for Pickup / Out for Delivery'
  | 'Completed';

export interface OrderItem {
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string; // e.g. GL-1234
  customerName: string;
  phone: string;
  email?: string;
  branch: 'Rongai Branch' | 'Ngong Branch';
  address: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  paymentStatus:
    | 'Paid via M-Pesa'
    | 'Pending M-Pesa'
    | 'Failed M-Pesa'
    | 'Cancelled M-Pesa'
    | 'Pay on Delivery';
  mpesaRef?: string;
  mpesaPhone?: string;
  mpesaAmount?: number;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  paymentStatusReason?: string;
  trackingNotes: { time: string; note: string; status: OrderStatus }[];
  deliveryType: 'Delivery to Door' | 'Self Pickup at Branch';
  specialNotes?: string;
}

export interface Branch {
  id: string;
  name: string;
  locationName: string;
  fullAddress: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  image: string;
  mapQuery: string;
  hours: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export interface Review {
  id: string;
  author: string;
  branch: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
