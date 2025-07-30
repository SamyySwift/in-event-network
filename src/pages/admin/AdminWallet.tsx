import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Wallet, Download } from 'lucide-react';
import { WithdrawalButton } from '@/components/admin/WithdrawalButton';
import { AdminEventProvider } from '@/hooks/useAdminEventContext';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import EventSelector from '@/components/admin/EventSelector';

function AdminWalletContent() {
  const { wallet, isLoading } = useAdminWallet();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Wallet Management
              </h1>
              <p className="text-muted-foreground">
                Manage your earnings and withdrawals
              </p>
            </div>
          </div>

          {/* Event Selector */}
          <EventSelector />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Earnings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ₦{((wallet?.total_earnings || 0) / 100).toLocaleString()}
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Available Balance</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ₦{((wallet?.available_balance || 0) / 100).toLocaleString()}
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Withdrawn</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ₦{((wallet?.withdrawn_amount || 0) / 100).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Details */}
        <div className="space-y-8">
          <Card className="rounded-xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!wallet ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No wallet found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start selling tickets to create your wallet and begin earning revenue
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bank Account Information */}
                  {wallet.bank_name && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium mb-2">Bank Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Bank:</span> {wallet.bank_name}</p>
                          <p><span className="text-muted-foreground">Account:</span> {wallet.account_number}</p>
                          <p><span className="text-muted-foreground">Name:</span> {wallet.account_name}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Verification:</span> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              wallet.is_bank_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {wallet.is_bank_verified ? 'Verified' : 'Pending'}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Minimum Payout:</span> 
                            ₦{((wallet.minimum_payout_amount || 1000) / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Low Balance Alert */}
                  {wallet.available_balance > 0 && wallet.available_balance < (wallet.minimum_payout_amount || 10) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 text-yellow-600 mt-0.5">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            Balance below minimum withdrawal
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                          You need at least ₦{((wallet.minimum_payout_amount || 1000) / 100).toLocaleString()} to make a withdrawal. 
                            Current balance: ₦{(wallet.available_balance / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withdrawal Section */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Withdrawals</h4>
                      <p className="text-sm text-muted-foreground">
                        {wallet.last_payout_at 
                          ? `Last withdrawal: ${new Date(wallet.last_payout_at).toLocaleDateString()}`
                          : 'No withdrawals yet'
                        }
                      </p>
                    </div>
                    {wallet && (
                      <WithdrawalButton
                        walletId={wallet.id}
                        availableBalance={wallet.available_balance}
                        totalWithdrawn={wallet.withdrawn_amount}
                        bankName={wallet.bank_name || undefined}
                        accountNumber={wallet.account_number || undefined}
                        accountName={wallet.account_name || undefined}
                        recipientCode={wallet.recipient_code || undefined}
                        isBankVerified={wallet.is_bank_verified || false}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminWallet() {
  return (
    <AdminEventProvider>
      <AdminWalletContent />
    </AdminEventProvider>
  );
}