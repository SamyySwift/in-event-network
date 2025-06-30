
import { useState } from 'react';
import { Wallet, Plus, Download, DollarSign, TrendingUp, Calendar, CreditCard, History, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';

export const AdminWallet = () => {
  const { wallet, isLoading, createWallet, hasWallet } = useAdminWallet();
  const { 
    withdrawalHistory, 
    banks, 
    verifyAccount, 
    createRecipient, 
    initiateWithdrawal,
    isVerifyingAccount,
    isCreatingRecipient,
    isInitiatingWithdrawal,
    isLoadingBanks
  } = useAdminWithdrawals();

  const [bankSetupDialogOpen, setBankSetupDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Bank setup form
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState('');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasWallet) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </span>
            <div>
              <CardTitle>Admin Wallet</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your event earnings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No wallet found</h3>
            <p className="text-muted-foreground mb-4">
              Create a wallet to track your ticket sales earnings
            </p>
            <Button onClick={() => createWallet.mutate()} disabled={createWallet.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {createWallet.isPending ? 'Creating...' : 'Create Wallet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber) return;

    const bank = banks.find(b => b.code === selectedBank);
    if (!bank) return;

    try {
      const result = await verifyAccount.mutateAsync({
        accountNumber,
        bankCode: selectedBank,
        bankName: bank.name,
      });

      if (result.status && result.data) {
        setIsAccountVerified(true);
        setVerifiedAccountName(result.data.account_name);
      }
    } catch (error) {
      console.error('Account verification failed:', error);
    }
  };

  const handleCreateRecipient = async () => {
    if (!verifiedAccountName || !accountNumber || !selectedBank) return;

    try {
      await createRecipient.mutateAsync({
        accountName: verifiedAccountName,
        accountNumber,
        bankCode: selectedBank,
      });
      setBankSetupDialogOpen(false);
      setSelectedBank('');
      setAccountNumber('');
      setIsAccountVerified(false);
      setVerifiedAccountName('');
    } catch (error) {
      console.error('Failed to create recipient:', error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount) * 100; // Convert to kobo
    if (!wallet || !wallet.recipient_code || amount <= 0 || amount > wallet.available_balance) return;

    try {
      await initiateWithdrawal.mutateAsync({
        walletId: wallet.id,
        amount,
        bankName: wallet.bank_name || '',
        accountNumber: wallet.account_number || '',
        accountName: wallet.account_name || '',
        recipientCode: wallet.recipient_code,
        currentBalance: wallet.available_balance,
        totalWithdrawn: wallet.withdrawn_amount,
      });
      setWithdrawAmount('');
      setWithdrawDialogOpen(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </span>
            <div>
              <CardTitle>Admin Wallet</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your event earnings</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bank-account">Bank Account</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Available Balance</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ₦{(wallet.available_balance / 100).toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Earnings</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  ₦{(wallet.total_earnings / 100).toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Withdrawn</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  ₦{(wallet.withdrawn_amount / 100).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Last payout: {wallet.last_payout_at 
                    ? new Date(wallet.last_payout_at).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>

              <div className="flex gap-2">
                {!wallet.is_bank_verified && (
                  <Dialog open={bankSetupDialogOpen} onOpenChange={setBankSetupDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Setup Bank Account
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}

                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      disabled={wallet.available_balance <= 0 || !wallet.is_bank_verified}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bank-account" className="space-y-4">
            {wallet.is_bank_verified ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Bank Account Verified</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Bank:</strong> {wallet.bank_name}</div>
                  <div><strong>Account Number:</strong> {wallet.account_number}</div>
                  <div><strong>Account Name:</strong> {wallet.account_name}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setBankSetupDialogOpen(true)}
                >
                  Update Bank Account
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bank Account Setup</h3>
                <p className="text-muted-foreground mb-6">
                  Add your Nigerian bank account to withdraw earnings
                </p>
                <Button onClick={() => setBankSetupDialogOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Setup Bank Account
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Withdrawal History</h3>
                <p className="text-muted-foreground">
                  Your withdrawal transactions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className="font-medium">₦{(withdrawal.amount / 100).toLocaleString()}</span>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>To: {withdrawal.bank_name} - {withdrawal.account_number}</div>
                      <div>Date: {new Date(withdrawal.created_at).toLocaleString()}</div>
                      {withdrawal.failure_reason && (
                        <div className="text-red-600">Reason: {withdrawal.failure_reason}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bank Setup Dialog */}
        <Dialog open={bankSetupDialogOpen} onOpenChange={setBankSetupDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Setup Bank Account</DialogTitle>
              <DialogDescription>
                Add your Nigerian bank account details to withdraw earnings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank">Select Bank</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank} disabled={isLoadingBanks}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Select your bank"} />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your account number"
                  maxLength={10}
                />
              </div>

              {!isAccountVerified && selectedBank && accountNumber.length === 10 && (
                <Button 
                  onClick={handleVerifyAccount} 
                  disabled={isVerifyingAccount}
                  className="w-full"
                >
                  {isVerifyingAccount ? 'Verifying...' : 'Verify Account'}
                </Button>
              )}

              {isAccountVerified && verifiedAccountName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Account Verified</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Account Name: <strong>{verifiedAccountName}</strong>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBankSetupDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRecipient}
                disabled={!isAccountVerified || isCreatingRecipient}
              >
                {isCreatingRecipient ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdrawal Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw to your bank account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet.available_balance / 100}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available: ₦{(wallet.available_balance / 100).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Minimum: ₦{(wallet.minimum_payout_amount / 100).toLocaleString()}
                </p>
              </div>
              
              {wallet.bank_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    Withdrawing to: <strong>{wallet.bank_name}</strong><br/>
                    Account: {wallet.account_number} ({wallet.account_name})
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount || 
                  parseFloat(withdrawAmount) <= 0 || 
                  parseFloat(withdrawAmount) * 100 > wallet.available_balance ||
                  parseFloat(withdrawAmount) * 100 < wallet.minimum_payout_amount ||
                  isInitiatingWithdrawal
                }
              >
                {isInitiatingWithdrawal ? 'Processing...' : 'Withdraw'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
