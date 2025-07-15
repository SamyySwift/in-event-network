import React, { useState } from 'react';
import { Download, Plus, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';

export function WithdrawalButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: ''
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { wallet, hasWallet } = useAdminWallet();
  const { 
    withdrawalHistory, 
    banks, 
    verifyAccount, 
    createRecipient, 
    initiateWithdrawal 
  } = useAdminWithdrawals();

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBankSelect = (value: string) => {
    const selectedBank = banks?.find(bank => bank.code === value);
    if (selectedBank) {
      setBankForm(prev => ({
        ...prev,
        bankCode: selectedBank.code,
        bankName: selectedBank.name
      }));
    }
  };

  const handleVerifyAccount = async () => {
    if (!bankForm.accountNumber || !bankForm.bankCode) {
      toast({
        title: "Missing Information",
        description: "Please enter account number and select a bank",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyAccount.mutateAsync({
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
        bankName: bankForm.bankName
      });

      if (result.account_name) {
        setBankForm(prev => ({ ...prev, accountName: result.account_name }));
        toast({
          title: "Account Verified",
          description: `Account verified for ${result.account_name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify account. Please check the details.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!wallet || !bankForm.accountName || !withdrawAmount) {
      toast({
        title: "Missing Information",
        description: "Please verify your account and enter withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(withdrawAmount);
    if (amount <= 0 || amount > wallet.available_balance) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between ₦1 and ₦${wallet.available_balance.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create recipient if needed
      let recipientCode = wallet.recipient_code;
      if (!recipientCode) {
        const recipientResult = await createRecipient.mutateAsync({
          accountName: bankForm.accountName,
          accountNumber: bankForm.accountNumber,
          bankCode: bankForm.bankCode
        });
        recipientCode = recipientResult.recipient_code;
      }

      // Initiate withdrawal
      await initiateWithdrawal.mutateAsync({
        walletId: wallet.id,
        amount,
        bankName: bankForm.bankName,
        accountNumber: bankForm.accountNumber,
        accountName: bankForm.accountName,
        recipientCode: recipientCode,
        currentBalance: wallet.available_balance,
        totalWithdrawn: wallet.withdrawn_amount
      });

      toast({
        title: "Withdrawal Successful",
        description: `₦${amount.toLocaleString()} has been transferred to your account`,
      });

      setIsDialogOpen(false);
      setWithdrawAmount('');
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Withdraw Earnings</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Withdrawal Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bank">Select Bank</Label>
                  <Select onValueChange={handleBankSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks?.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      value={bankForm.accountNumber}
                      onChange={handleBankInputChange}
                      placeholder="Enter 10-digit account number"
                      maxLength={10}
                    />
                    <Button 
                      onClick={handleVerifyAccount}
                      disabled={isVerifying || !bankForm.accountNumber || !bankForm.bankCode}
                      variant="outline"
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>

                {bankForm.accountName && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 font-medium">{bankForm.accountName}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="amount">Withdrawal Amount</Label>
                  <Input
                    id="amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    type="number"
                    min="1"
                    max={wallet?.available_balance || 0}
                  />
                  {wallet && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Available balance: ₦{wallet.available_balance.toLocaleString()}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={isProcessing || !bankForm.accountName || !withdrawAmount}
                  className="w-full"
                >
                  {isProcessing ? "Processing..." : "Withdraw Funds"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalHistory && withdrawalHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalHistory.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>₦{withdrawal.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(withdrawal.created_at || '').toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                withdrawal.status === 'completed' ? 'default' :
                                withdrawal.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No withdrawal history yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}