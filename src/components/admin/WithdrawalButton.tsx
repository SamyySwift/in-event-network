
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WithdrawalButtonProps {
  walletId: string;
  availableBalance: number;
  totalWithdrawn: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  recipientCode?: string;
  isBankVerified?: boolean;
}

export const WithdrawalButton: React.FC<WithdrawalButtonProps> = ({
  walletId,
  availableBalance,
  totalWithdrawn,
  bankName: existingBankName,
  accountNumber: existingAccountNumber,
  accountName: existingAccountName,
  recipientCode: existingRecipientCode,
  isBankVerified: existingIsBankVerified,
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'bank' | 'amount' | 'confirm'>('bank');
  const [accountNumber, setAccountNumber] = useState(existingAccountNumber || '');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState(existingBankName || '');
  const [verifiedAccountName, setVerifiedAccountName] = useState(existingAccountName || '');
  const [recipientCode, setRecipientCode] = useState(existingRecipientCode || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isBankVerified, setIsBankVerified] = useState(existingIsBankVerified || false);

  const {
    banks,
    isLoadingBanks,
    verifyAccount,
    createRecipient,
    initiateWithdrawal,
    isVerifyingAccount,
    isCreatingRecipient,
    isInitiatingWithdrawal,
  } = useAdminWithdrawals();

  const handleBankVerification = async () => {
    if (!accountNumber || !selectedBankCode || !selectedBankName) {
      return;
    }

    try {
      console.log('Verifying bank account:', { accountNumber, selectedBankCode, selectedBankName });
      
      const result = await verifyAccount.mutateAsync({
        accountNumber,
        bankCode: selectedBankCode,
        bankName: selectedBankName,
      });

      console.log('Bank verification result:', result);
      
      if (result.success && result.account_name) {
        setVerifiedAccountName(result.account_name);
        setIsBankVerified(true);
        console.log('Account verified successfully:', result.account_name);
      }
    } catch (error) {
      console.error('Bank verification failed:', error);
    }
  };

  const handleCreateRecipient = async () => {
    if (!verifiedAccountName || !accountNumber || !selectedBankCode) {
      return;
    }

    try {
      console.log('Creating recipient:', { verifiedAccountName, accountNumber, selectedBankCode });
      
      const result = await createRecipient.mutateAsync({
        accountName: verifiedAccountName,
        accountNumber,
        bankCode: selectedBankCode,
      });

      console.log('Recipient creation result:', result);
      
      if (result.success && result.recipient_code) {
        setRecipientCode(result.recipient_code);
        setStep('amount');
        console.log('Recipient created successfully:', result.recipient_code);
      }
    } catch (error) {
      console.error('Recipient creation failed:', error);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount <= 0 || !recipientCode || !verifiedAccountName) {
      return;
    }

    try {
      console.log('Processing withdrawal:', {
        walletId,
        amount,
        selectedBankName,
        accountNumber,
        verifiedAccountName,
        recipientCode,
        availableBalance,
        totalWithdrawn
      });

      await initiateWithdrawal.mutateAsync({
        walletId,
        amount,
        bankName: selectedBankName,
        accountNumber,
        accountName: verifiedAccountName,
        recipientCode,
        currentBalance: availableBalance,
        totalWithdrawn,
      });

      // Reset form and close dialog on success
      setOpen(false);
      setStep('bank');
      setWithdrawalAmount('');
      console.log('Withdrawal completed successfully');
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const canWithdraw = availableBalance > 0 && availableBalance >= 100; // Minimum ₦100

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={!canWithdraw}
          className="w-full"
          onClick={() => {
            console.log('Withdrawal button clicked:', { 
              canWithdraw, 
              availableBalance, 
              isBankVerified: existingIsBankVerified 
            });
            
            if (existingIsBankVerified && existingRecipientCode) {
              setStep('amount');
            } else {
              setStep('bank');
            }
          }}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Withdraw Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        {step === 'bank' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bank Account Setup</CardTitle>
                <CardDescription>
                  Verify your bank account to enable withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bank">Select Bank</Label>
                  <Select value={selectedBankCode} onValueChange={(value) => {
                    setSelectedBankCode(value);
                    const bank = banks.find(b => b.code === value);
                    setSelectedBankName(bank?.name || '');
                    console.log('Bank selected:', { code: value, name: bank?.name });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBanks ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading banks...</span>
                        </div>
                      ) : (
                        banks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setIsBankVerified(false);
                      setVerifiedAccountName('');
                    }}
                    placeholder="Enter your account number"
                    maxLength={10}
                  />
                </div>

                {!isBankVerified ? (
                  <Button
                    onClick={handleBankVerification}
                    disabled={!accountNumber || !selectedBankCode || isVerifyingAccount}
                    className="w-full"
                  >
                    {isVerifyingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Account'
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Account verified: <strong>{verifiedAccountName}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {isBankVerified && !recipientCode && (
                  <Button
                    onClick={handleCreateRecipient}
                    disabled={isCreatingRecipient}
                    className="w-full"
                  >
                    {isCreatingRecipient ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Setup Withdrawal'
                    )}
                  </Button>
                )}

                {recipientCode && (
                  <Button
                    onClick={() => setStep('amount')}
                    className="w-full"
                  >
                    Continue to Withdrawal
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Withdrawal Amount</CardTitle>
                <CardDescription>
                  Available Balance: ₦{availableBalance.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    min="100"
                    max={availableBalance}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum withdrawal: ₦100
                  </p>
                </div>

                {verifiedAccountName && (
                  <Alert>
                    <AlertDescription>
                      Withdrawing to: <strong>{verifiedAccountName}</strong> ({selectedBankName})
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('bank')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleWithdrawal}
                    disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 100 || 
                             parseFloat(withdrawalAmount) > availableBalance || isInitiatingWithdrawal}
                    className="flex-1"
                  >
                    {isInitiatingWithdrawal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
