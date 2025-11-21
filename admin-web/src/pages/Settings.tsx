// admin-web/src/pages/Settings.tsx

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { admin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SportShop',
    siteEmail: 'admin@sportshop.com',
    sitePhone: '+84 123 456 789',
    siteAddress: '123 Main St, Ho Chi Minh City, Vietnam',
    currency: 'USD',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    customerNotifications: true,
    lowStockAlerts: true,
    marketingEmails: false,
  });

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
    standardShipping: '5.00',
    expressShipping: '15.00',
    freeShippingThreshold: '100.00',
    enableFreeShipping: true,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableCOD: true,
    enableCreditCard: true,
    enablePayPal: false,
    enableStripe: false,
    taxRate: '10',
  });

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <SettingsIcon /> },
    { id: 'notifications', name: 'Notifications', icon: <BellIcon /> },
    { id: 'shipping', name: 'Shipping', icon: <TruckIcon /> },
    { id: 'payment', name: 'Payment', icon: <CreditCardIcon /> },
    { id: 'profile', name: 'Profile', icon: <UserIcon /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span className="w-5 h-5">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.siteEmail}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.sitePhone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, sitePhone: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={generalSettings.siteAddress}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteAddress: e.target.value })
                    }
                    className="input min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, currency: e.target.value })
                      }
                      className="input"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="VND">VND (₫)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                      }
                      className="input"
                    >
                      <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (GMT+7)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSave('General')}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive email notifications</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Order Notifications</div>
                    <div className="text-sm text-gray-500">Get notified about new orders</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        orderNotifications: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Customer Notifications</div>
                    <div className="text-sm text-gray-500">New customer registrations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.customerNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        customerNotifications: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Low Stock Alerts</div>
                    <div className="text-sm text-gray-500">When products are running low</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lowStockAlerts}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        lowStockAlerts: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Marketing Emails</div>
                    <div className="text-sm text-gray-500">Promotional campaigns and updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <div className="pt-4">
                  <button
                    onClick={() => handleSave('Notification')}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.standardShipping}
                    onChange={(e) =>
                      setShippingSettings({ ...shippingSettings, standardShipping: e.target.value })
                    }
                    className="input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Express Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.expressShipping}
                    onChange={(e) =>
                      setShippingSettings({ ...shippingSettings, expressShipping: e.target.value })
                    }
                    className="input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={shippingSettings.enableFreeShipping}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        enableFreeShipping: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Enable Free Shipping</div>
                    <div className="text-sm text-gray-500">
                      Offer free shipping for orders above threshold
                    </div>
                  </div>
                </label>

                {shippingSettings.enableFreeShipping && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) =>
                        setShippingSettings({
                          ...shippingSettings,
                          freeShippingThreshold: e.target.value,
                        })
                      }
                      className="input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => handleSave('Shipping')}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-500">Accept cash payments on delivery</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableCOD}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, enableCOD: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Credit Card</div>
                    <div className="text-sm text-gray-500">Accept credit card payments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableCreditCard}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, enableCreditCard: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">PayPal</div>
                    <div className="text-sm text-gray-500">Accept PayPal payments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enablePayPal}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, enablePayPal: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Stripe</div>
                    <div className="text-sm text-gray-500">Accept payments via Stripe</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableStripe}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, enableStripe: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={paymentSettings.taxRate}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })
                    }
                    className="input"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSave('Payment')}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Account Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileSettings.name}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, name: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, email: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileSettings.currentPassword}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, currentPassword: e.target.value })
                      }
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileSettings.newPassword}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, newPassword: e.target.value })
                      }
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileSettings.confirmPassword}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })
                      }
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSave('Profile')}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons
function SettingsIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}