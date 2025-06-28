import { useState } from 'react';
import { Wallet, Plus, Download, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export const AdminWallet = () => {
  const { wallet, isLoading, createWallet, withdrawFunds, hasWallet } = useAdminWallet();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

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

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= wallet.available_balance) {
      withdrawFunds.mutate(amount);
      setWithdrawAmount('');
      setWithdrawDialogOpen(false);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Available Balance</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              ₦{wallet.available_balance.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ₦{wallet.total_earnings.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Withdrawn</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              ₦{wallet.withdrawn_amount.toLocaleString()}
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

          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={wallet.available_balance <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to withdraw from your available balance.
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
                    max={wallet.available_balance}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available: ₦{wallet.available_balance.toLocaleString()}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet.available_balance || withdrawFunds.isPending}
                >
                  {withdrawFunds.isPending ? 'Processing...' : 'Withdraw'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};