export type DogStatus =
  | 'spotted'
  | 'hungry'
  | 'fed'
  | 'hurt'
  | 'urgent'
  | 'sick'
  | 'friendly'
  | 'aggressive'
  | 'bathed'
  | 'rescued';

export interface StatusConfig {
  label: { en: string; th: string };
  color: string;
  bgColor: string;
  icon: string;
}

export const DOG_STATUSES: Record<DogStatus, StatusConfig> = {
  spotted: {
    label: { en: 'Spotted', th: 'พบเห็น' },
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: '👀',
  },
  hungry: {
    label: { en: 'Hungry', th: 'หิว' },
    color: '#f97316',
    bgColor: '#fff7ed',
    icon: '🍽️',
  },
  fed: {
    label: { en: 'Fed', th: 'ได้กินแล้ว' },
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: '✅',
  },
  hurt: {
    label: { en: 'Hurt', th: 'บาดเจ็บ' },
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: '🩹',
  },
  urgent: {
    label: { en: 'Urgent', th: 'เร่งด่วน' },
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '🚨',
  },
  sick: {
    label: { en: 'Sick', th: 'ป่วย' },
    color: '#a855f7',
    bgColor: '#faf5ff',
    icon: '🤒',
  },
  friendly: {
    label: { en: 'Friendly', th: 'เป็นมิตร' },
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: '💙',
  },
  aggressive: {
    label: { en: 'Aggressive', th: 'ดุ' },
    color: '#ea580c',
    bgColor: '#fff7ed',
    icon: '⚠️',
  },
  bathed: {
    label: { en: 'Bathed', th: 'อาบน้ำแล้ว' },
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    icon: '🚿',
  },
  rescued: {
    label: { en: 'Rescued', th: 'ถูกช่วยแล้ว' },
    color: '#eab308',
    bgColor: '#fefce8',
    icon: '🏠',
  },
};

export const ALL_STATUSES = Object.keys(DOG_STATUSES) as DogStatus[];

// i18n translations
export type Lang = 'en' | 'th';

export const T: Record<string, Record<Lang, string>> = {
  appName: { en: 'Dog Help Map', th: 'แผนที่ช่วยหมา' },
  reportDog: { en: 'Report a Dog', th: 'รายงานสุนัข' },
  signIn: { en: 'Sign in with Google', th: 'เข้าสู่ระบบด้วย Google' },
  signOut: { en: 'Sign Out', th: 'ออกจากระบบ' },
  myReports: { en: 'My Reports', th: 'รายงานของฉัน' },
  status: { en: 'Status', th: 'สถานะ' },
  description: { en: 'Description', th: 'รายละเอียด' },
  photo: { en: 'Photo', th: 'รูปภาพ' },
  dogCount: { en: 'Number of Dogs', th: 'จำนวนสุนัข' },
  submit: { en: 'Submit', th: 'ส่ง' },
  cancel: { en: 'Cancel', th: 'ยกเลิก' },
  close: { en: 'Close', th: 'ปิด' },
  filter: { en: 'Filter', th: 'กรอง' },
  all: { en: 'All', th: 'ทั้งหมด' },
  heatmap: { en: 'Heatmap', th: 'แผนที่ความหนาแน่น' },
  pins: { en: 'Pins', th: 'ปักหมุด' },
  locateMe: { en: 'Locate Me', th: 'ตำแหน่งของฉัน' },
  tapToPlace: { en: 'Tap map to place pin', th: 'แตะแผนที่เพื่อปักหมุด' },
  useMyLocation: { en: 'Use My Location', th: 'ใช้ตำแหน่งของฉัน' },
  reportedBy: { en: 'Reported by', th: 'รายงานโดย' },
  updateStatus: { en: 'Update Status', th: 'อัปเดตสถานะ' },
  statusHistory: { en: 'Status History', th: 'ประวัติสถานะ' },
  dogs: { en: 'dogs', th: 'ตัว' },
  ago: { en: 'ago', th: 'ที่แล้ว' },
  justNow: { en: 'Just now', th: 'เมื่อสักครู่' },
  minutesAgo: { en: 'min ago', th: 'นาทีที่แล้ว' },
  hoursAgo: { en: 'hr ago', th: 'ชั่วโมงที่แล้ว' },
  daysAgo: { en: 'days ago', th: 'วันที่แล้ว' },
  loginToReport: { en: 'Sign in to report a pet', th: 'เข้าสู่ระบบเพื่อรายงานสัตว์' },
  optional: { en: 'optional', th: 'ไม่บังคับ' },
  uploading: { en: 'Uploading...', th: 'กำลังอัปโหลด...' },
  submitting: { en: 'Submitting...', th: 'กำลังส่ง...' },
  note: { en: 'Note', th: 'หมายเหตุ' },
  // Admin
  adminPanel: { en: 'Admin Panel', th: 'แผงควบคุม' },
  adminDashboard: { en: 'Dashboard', th: 'แดชบอร์ด' },
  backToMap: { en: 'Back to Map', th: 'กลับไปแผนที่' },
  totalReports: { en: 'Total Reports', th: 'รายงานทั้งหมด' },
  totalUsers: { en: 'Total Users', th: 'ผู้ใช้ทั้งหมด' },
  statusUpdates: { en: 'Status Updates', th: 'อัปเดตสถานะ' },
  reportsToday: { en: 'Reports Today', th: 'รายงานวันนี้' },
  reportsLast7Days: { en: 'Reports (Last 7 Days)', th: 'รายงาน (7 วันล่าสุด)' },
  signupsLast7Days: { en: 'Signups (Last 7 Days)', th: 'สมัคร (7 วันล่าสุด)' },
  totalViews: { en: 'Total Views', th: 'ยอดเข้าชม' },
  uniqueVisitors: { en: 'Unique Visitors', th: 'ผู้เข้าชม' },
  viewsLast7Days: { en: 'Views (Last 7 Days)', th: 'เข้าชม (7 วันล่าสุด)' },
  allReports: { en: 'All Reports', th: 'รายงานทั้งหมด' },
  location: { en: 'Location', th: 'ตำแหน่ง' },
  date: { en: 'Date', th: 'วันที่' },
  actions: { en: 'Actions', th: 'การกระทำ' },
  deleteReport: { en: 'Delete', th: 'ลบ' },
  confirmDelete: { en: 'Are you sure you want to delete this report?', th: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายงานนี้?' },
  viewOnMap: { en: 'View on Map', th: 'ดูบนแผนที่' },
  noReports: { en: 'No reports yet', th: 'ยังไม่มีรายงาน' },
  unauthorized: { en: 'Unauthorized', th: 'ไม่ได้รับอนุญาต' },
  // Pet type
  dog: { en: 'Dog', th: 'สุนัข' },
  cat: { en: 'Cat', th: 'แมว' },
  petType: { en: 'Pet Type', th: 'ประเภทสัตว์' },
  reportDogOrCat: { en: 'Report a Pet', th: 'รายงานสัตว์' },
  // Adoption
  applyToAdopt: { en: 'Apply to Adopt', th: 'สมัครรับเลี้ยง' },
  adoptionForm: { en: 'Adoption Application', th: 'ใบสมัครรับเลี้ยง' },
  adoptionSubmitted: { en: 'Application submitted!', th: 'ส่งใบสมัครแล้ว!' },
  fullName: { en: 'Full Name', th: 'ชื่อ-นามสกุล' },
  phone: { en: 'Phone Number', th: 'เบอร์โทรศัพท์' },
  lineId: { en: 'LINE ID', th: 'LINE ID' },
  address: { en: 'Address', th: 'ที่อยู่' },
  housingType: { en: 'Housing Type', th: 'ประเภทที่พัก' },
  house: { en: 'House', th: 'บ้าน' },
  condo: { en: 'Condo', th: 'คอนโด' },
  apartment: { en: 'Apartment', th: 'อพาร์ตเมนต์' },
  housingOwnership: { en: 'Ownership', th: 'การถือครอง' },
  own: { en: 'Own', th: 'เจ้าของ' },
  rent: { en: 'Rent', th: 'เช่า' },
  hasOutdoorSpace: { en: 'Has outdoor/yard space', th: 'มีพื้นที่กลางแจ้ง / สนามหลังบ้าน' },
  numAdults: { en: 'Number of Adults in Household', th: 'จำนวนผู้ใหญ่ในบ้าน' },
  numChildren: { en: 'Number of Children', th: 'จำนวนเด็กในบ้าน' },
  hasAllergies: { en: 'Anyone in household has pet allergies', th: 'มีคนในบ้านแพ้สัตว์เลี้ยง' },
  currentPets: { en: 'Current Pets (if any)', th: 'สัตว์เลี้ยงปัจจุบัน (ถ้ามี)' },
  pastExperience: { en: 'Past Experience with Pets', th: 'ประสบการณ์เลี้ยงสัตว์ในอดีต' },
  reason: { en: 'Why do you want to adopt this pet?', th: 'ทำไมคุณถึงอยากรับเลี้ยงสัตว์ตัวนี้?' },
  // Admin applications
  applications: { en: 'Adoption Applications', th: 'ใบสมัครรับเลี้ยง' },
  applicant: { en: 'Applicant', th: 'ผู้สมัคร' },
  pending: { en: 'Pending', th: 'รอพิจารณา' },
  approved: { en: 'Approved', th: 'อนุมัติ' },
  rejected: { en: 'Rejected', th: 'ปฏิเสธ' },
  approve: { en: 'Approve', th: 'อนุมัติ' },
  reject: { en: 'Reject', th: 'ปฏิเสธ' },
  adminNote: { en: 'Admin Note', th: 'หมายเหตุ (admin)' },
  noApplications: { en: 'No applications yet', th: 'ยังไม่มีใบสมัคร' },
};

export const BANGKOK_CENTER = { lat: 13.7563, lng: 100.5018 };
export const DEFAULT_ZOOM = 13;
