import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, CreditCard, Download, Plus, TrendingUp, DollarSign, Calendar, ExternalLink, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';
import { useToast } from '@/hooks/use-toast';
import { PaystackWithdrawalModal } from './PaystackWithdrawalModal';

export function AdminWallet() {
  const { wallet, isLoading, createWallet, hasWallet } = useAdminWallet();
  const { 
    withdrawalHistory, 
    banks, 
    verifyAccount, 
    createRecipient, 
    initiateWithdrawal,
    isVerifyingAccount,
    isCreatingRecipient,
    isInitiatingWithdrawal
  } = useAdminWithdrawals();
  const { toast } = useToast();

  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verificationStep, setVerificationStep] = useState<'bank' | 'verify' | 'recipient'>('bank');

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawAmount(e.target.value);
  };

  const handleBankSelect = (value: string) => {
    const selectedBank = banks.find(bank => bank.code === value);
    if (selectedBank) {
      setBankForm({
        ...bankForm,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      });
    }
  };

  const handleVerifyAccount = async () => {
    try {
      setVerificationStep('verify');
      await verifyAccount.mutateAsync({
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
        bankName: bankForm.bankName,
      });
      setVerificationStep('recipient');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify bank account',
        variant: 'destructive',
      });
      setVerificationStep('bank');
    }
  };

  const handleCreateRecipient = async () => {
    try {
      await createRecipient.mutateAsync({
        accountName: bankForm.accountName,
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
      });
    } catch (error: any) {
      toast({
        title: 'Recipient Creation Failed',
        description: error.message || 'Failed to create recipient',
        variant: 'destructive',
      });
    }
  };

  const handleInitiateWithdrawal = async () => {
    if (!wallet) return;

    const amount = parseFloat(withdrawAmount);
    const transferFee = 50;
    const totalDeducted = amount + transferFee;

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount',
        variant: 'destructive',
      });
      return;
    }

    if (totalDeducted > wallet.available_balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ₦${totalDeducted.toLocaleString()} (including ₦50 transfer fee) but only have ₦${wallet.available_balance.toLocaleString()} available`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await initiateWithdrawal.mutateAsync({
        walletId: wallet.id,
        amount: amount * 100, // Amount in kobo
        bankName: wallet.bank_name || bankForm.bankName,
        accountNumber: wallet.account_number || bankForm.accountNumber,
        accountName: wallet.account_name || bankForm.accountName,
        recipientCode: wallet.recipient_code || '',
        currentBalance: wallet.available_balance,
        totalWithdrawn: wallet.withdrawn_amount,
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to initiate withdrawal',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasWallet) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Admin Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Create your wallet to start receiving payments from ticket sales.
          </p>
          <Button 
            onClick={() => createWallet.mutate()} 
            disabled={createWallet.isPending}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Earnings</p>
                <p className="text-2xl font-bold text-blue-900">₦{wallet?.total_earnings?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-900">₦{wallet?.available_balance?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Withdrawn</p>
                <p className="text-2xl font-bold text-purple-900">₦{wallet?.withdrawn_amount?.toLocaleString() || 0}</p>
              </div>
              <Download className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Last Payout</p>
                <p className="text-sm font-semibold text-orange-900">
                  {wallet?.last_payout_at ? new Date(wallet.last_payout_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {!wallet?.is_bank_verified ? (
              <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Setup Bank Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Setup Bank Account</DialogTitle>
                  </DialogHeader>

                  {verificationStep === 'bank' && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bank">Bank</Label>
                        <Select onValueChange={handleBankSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bank" />
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
                      <div className="grid gap-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          type="text"
                          id="accountNumber"
                          name="accountNumber"
                          value={bankForm.accountNumber}
                          onChange={handleBankInputChange}
                        />
                      </div>
                      <Button onClick={handleVerifyAccount} disabled={isVerifyingAccount} className="w-full">
                        {isVerifyingAccount ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Verifying...
                          </>
                        ) : (
                          'Verify Account'
                        )}
                      </Button>
                    </div>
                  )}

                  {verificationStep === 'verify' && (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}

                  {verificationStep === 'recipient' && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          type="text"
                          id="accountName"
                          name="accountName"
                          value={bankForm.accountName}
                          onChange={handleBankInputChange}
                        />
                      </div>
                      <Button onClick={handleCreateRecipient} disabled={isCreatingRecipient} className="w-full">
                        {isCreatingRecipient ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Creating Recipient...
                          </>
                        ) : (
                          'Create Recipient'
                        )}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-green-900">{wallet.bank_name}</p>
                  <p className="text-xs text-green-700">{wallet.account_number} • {wallet.account_name}</p>
                </div>
                
                <Button 
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!wallet?.available_balance || wallet.available_balance < wallet.minimum_payout_amount}
                  className="sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Withdraw via Paystack
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      {withdrawalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalHistory.slice(0, 5).map((withdrawal) => (
                <div key={withdrawal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">₦{withdrawal.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{withdrawal.bank_name} • {withdrawal.account_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge 
                    variant={
                      withdrawal.status === 'completed' ? 'default' : 
                      withdrawal.status === 'failed' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {withdrawal.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paystack Withdrawal Modal */}
      <PaystackWithdrawalModal 
        open={showWithdrawModal} 
        onOpenChange={setShowWithdrawModal} 
      />
    </div>
  );
}
