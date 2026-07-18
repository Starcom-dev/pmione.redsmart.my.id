export default function StatusBadge({ status }) {
  const colors = {
    // Letter
    DRAFT: 'bg-gray-100 text-gray-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    SIGNED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-purple-100 text-purple-700',
    // Meeting
    SCHEDULED: 'bg-blue-100 text-blue-700',
    ONGOING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
    // Emergency
    STANDBY: 'bg-green-100 text-green-700',
    ACTIVE: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    // Work Order
    OPEN: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    ON_HOLD: 'bg-orange-100 text-orange-700',
    // Priority
    LOW: 'bg-gray-100 text-gray-500',
    MEDIUM: 'bg-blue-100 text-blue-600',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
    // Donation
    WAITING: 'bg-yellow-100 text-yellow-700',
    DISPATCHED: 'bg-blue-100 text-blue-700',
    ON_SCENE: 'bg-orange-100 text-orange-700',
    TO_HOSPITAL: 'bg-purple-100 text-purple-700',
    // Info/Warning/Critical
    INFO: 'bg-blue-100 text-blue-600',
    WARNING: 'bg-yellow-100 text-yellow-700',
    // Employee
    ACTIVE_EMP: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-red-100 text-red-700',
    CONTRACT: 'bg-yellow-100 text-yellow-700',
    VOLUNTEER: 'bg-purple-100 text-purple-700',
    // Budget
    SUBMITTED: 'bg-blue-100 text-blue-700',
    // Leave
    PRESENT: 'bg-green-100 text-green-600',
    LATE: 'bg-yellow-100 text-yellow-700',
    ABSENT: 'bg-red-100 text-red-700',
    PERMIT: 'bg-blue-100 text-blue-600',
    SICK: 'bg-purple-100 text-purple-700',
    // MoU
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    // Ambulance booking status
    'EN_ROUTE': 'bg-blue-100 text-blue-700',
  };

  const label = status === 'IN_PROGRESS' ? 'IN PROGRESS' : status;
  const colorClass = colors[status] || colors[status?.replace(/_/g, '')] || 'bg-gray-100 text-gray-600';

  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{label}</span>;
}
