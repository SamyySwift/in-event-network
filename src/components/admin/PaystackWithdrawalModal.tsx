import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Wallet,
  Building,
  User,
  Lock,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PaystackWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawalStep = 'amount' | 'bank' | 'verify' | 'review' | 'processing' | 'success' | 'error';

export function PaystackWithdrawalModal({ open, onOpenChange }: PaystackWithdrawalModalProps) {
  const { wallet } = useAdminWallet();
  const { 
    banks, 
    verifyAccount, 
    createRecipient, 
    initiateWithdrawal,
    isVerifyingAccount,
    isCreatingRecipient,
    isInitiatingWithdrawal
  } = useAdminWithdrawals();
  const { toast } = useToast();

  const [step, setStep] = useState<WithdrawalStep>('amount');
  const [amount, setAmount] = useState('');
  const [bankForm, setBankForm] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [verifiedAccountName, setVerifiedAccountName] = useState('');
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null);
  const [error, setError] = useState('');

  const transferFee = 50;
  const totalDeducted = parseFloat(amount || '0') + transferFee;

  const steps = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'bank', title: 'Bank Details', icon: Building },
    { id: 'verify', title: 'Verify', icon: Shield },
    { id: 'review', title: 'Review', icon: CheckCircle },
    { id: 'processing', title: 'Processing', icon: Clock },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (open && wallet?.is_bank_verified) {
      // If bank is already verified, skip to amount step
      setBankForm({
        bankCode: wallet.bank_code || '',
        bankName: wallet.bank_name || '',
        accountNumber: wallet.account_number || '',
        accountName: wallet.account_name || '',
      });
      setVerifiedAccountName(wallet.account_name || '');
    }
  }, [open, wallet]);

  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setBankForm({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
    setVerifiedAccountName('');
    setWithdrawalResult(null);
    setError('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const handleAmountNext = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (totalDeducted > (wallet?.available_balance || 0)) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ₦${totalDeducted.toLocaleString()} (including ₦${transferFee} transfer fee) but only have ₦${wallet?.available_balance?.toLocaleString() || 0} available`,
        variant: 'destructive',
      });
      return;
    }

    if (wallet?.is_bank_verified) {
      setStep('review');
    } else {
      setStep('bank');
    }
  };

  const handleBankNext = () => {
    if (!bankForm.bankCode || !bankForm.accountNumber) {
      toast({
        title: 'Missing Information',
        description: 'Please select a bank and enter account number',
        variant: 'destructive',
      });
      return;
    }
    setStep('verify');
  };

  const handleVerifyAccount = async () => {
    try {
      const result = await verifyAccount.mutateAsync({
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
        bankName: bankForm.bankName,
      });
      
      setVerifiedAccountName(result.account_name);
      setBankForm(prev => ({ ...prev, accountName: result.account_name }));
      setStep('review');
    } catch (error: any) {
      setError(error.message || 'Failed to verify bank account');
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify bank account',
        variant: 'destructive',
      });
    }
  };

  const handleWithdrawal = async () => {
    if (!wallet) return;

    setStep('processing');
    
    try {
      // Create recipient if not already verified
      if (!wallet.is_bank_verified) {
        await createRecipient.mutateAsync({
          accountName: bankForm.accountName,
          accountNumber: bankForm.accountNumber,
          bankCode: bankForm.bankCode,
        });
      }

      const result = await initiateWithdrawal.mutateAsync({
        walletId: wallet.id,
        amount: parseFloat(amount) * 100, // Amount in kobo
        bankName: bankForm.bankName,
        accountNumber: bankForm.accountNumber,
        accountName: bankForm.accountName,
        recipientCode: wallet.recipient_code || '',
        currentBalance: wallet.available_balance,
        totalWithdrawn: wallet.withdrawn_amount,
      });

      setWithdrawalResult(result);
      setStep('success');
    } catch (error: any) {
      setError(error.message || 'Withdrawal failed');
      setStep('error');
    }
  };

  const handleBankSelect = (value: string) => {
    const selectedBank = banks.find(bank => bank.code === value);
    if (selectedBank) {
      setBankForm(prev => ({
        ...prev,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Withdraw Funds
          </DialogTitle>
          
          {step !== 'success' && step !== 'error' && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {steps.map((s, index) => (
                  <div 
                    key={s.id}
                    className={cn(
                      "flex flex-col items-center space-y-1",
                      index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <s.icon className="w-4 h-4" />
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Amount Step */}
          {step === 'amount' && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Available Balance</p>
                      <p className="text-2xl font-bold text-blue-900">₦{wallet?.available_balance?.toLocaleString() || 0}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 text-lg h-12"
                  />
                </div>
              </div>

              {amount && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Withdrawal amount:</span>
                      <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Transfer fee:</span>
                      <span>₦{transferFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total deducted from balance:</span>
                      <span>₦{totalDeducted.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button onClick={handleAmountNext} className="w-full h-12" size="lg">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Bank Details Step */}
          {step === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Shield className="w-4 h-4" />
                <span>Your bank details are encrypted and secure</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Select Bank</Label>
                <Select onValueChange={handleBankSelect} value={bankForm.bankCode}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose your bank" />
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

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter your account number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="h-12"
                  maxLength={10}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleBankNext} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className="space-y-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Account Verification</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        We'll verify your account details with {bankForm.bankName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span className="font-medium">{bankForm.bankName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Account Number:</span>
                  <span className="font-medium">{bankForm.accountNumber}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('bank')} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyAccount} 
                  disabled={isVerifyingAccount}
                  className="flex-1"
                >
                  {isVerifyingAccount ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Account
                      <Shield className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Ready to Withdraw</span>
                  </div>
                  <p className="text-sm text-green-700">Please review your withdrawal details</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Withdrawal Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold text-lg">₦{parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Transfer fee:</span>
                      <span className="font-medium">₦{transferFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Total deducted:</span>
                      <span className="font-bold text-lg">₦{totalDeducted.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Bank Details</h3>
                  <Card className="border-muted">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{bankForm.bankName}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{verifiedAccountName || bankForm.accountName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{bankForm.accountNumber}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(wallet?.is_bank_verified ? 'amount' : 'verify')} 
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleWithdrawal} className="flex-1 bg-green-600 hover:bg-green-700">
                  Confirm Withdrawal
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="space-y-6 text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing Withdrawal</h3>
                <p className="text-muted-foreground">
                  Please wait while we process your withdrawal request...
                </p>
              </div>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-left">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Your transaction is encrypted and secure</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">Withdrawal Successful!</h3>
                <p className="text-muted-foreground">
                  Your withdrawal of ₦{parseFloat(amount).toLocaleString()} has been processed successfully.
                </p>
              </div>
              
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount withdrawn:</span>
                    <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Destination:</span>
                    <span className="font-medium">{bankForm.bankName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing time:</span>
                    <span className="font-medium">1-24 hours</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleClose} className="w-full" variant="outline">
                Close
              </Button>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">Withdrawal Failed</h3>
                <p className="text-muted-foreground">
                  {error || 'An error occurred while processing your withdrawal.'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('review')} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleClose} className="flex-1" variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}