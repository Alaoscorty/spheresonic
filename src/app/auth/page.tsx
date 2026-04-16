
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Beatmaker');
  const [plan, setPlan] = useState('Free');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalRole = adminCode === 'beat716' ? 'Admin' : role;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile: any = {
        id: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || 'new-user',
        role: finalRole,
        plan: finalRole === 'Admin' ? 'VIP' : plan,
        commissionRate: plan === 'VIP' || finalRole === 'Admin' ? 0 : 0.10,
        isSuspended: false,
        featuredByAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aiUsageCount: 0,
      };
      
      if (userProfile.plan === 'VIP') {
        const now = new Date();
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        userProfile.vipStartDate = Timestamp.fromDate(now);
        userProfile.vipEndDate = Timestamp.fromDate(twoYearsFromNow);
      }


      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      
      if (finalRole === 'Artist' || finalRole === 'Beatmaker') {
        const publicProfile = {
          id: user.uid,
          username: userProfile.username,
          role: finalRole,
          featuredByAdmin: false,
          tracksCount: 0,
        };
        await setDoc(doc(firestore, 'creators', user.uid), publicProfile);
      }

      if (finalRole === 'Admin') {
        await setDoc(doc(firestore, 'roles_admin', user.uid), { uid: user.uid });
      }

      toast({ title: 'Account created successfully!' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl" suppressHydrationWarning>{t('SignupTitle')}</CardTitle>
          <CardDescription suppressHydrationWarning>
            {t('SignupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label suppressHydrationWarning>{t('IAmAn')}</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Artist" id="artist" />
                  <Label htmlFor="artist" suppressHydrationWarning>{t('Artist')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Beatmaker" id="beatmaker" />
                  <Label htmlFor="beatmaker" suppressHydrationWarning>{t('Beatmaker')}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan" suppressHydrationWarning>{t('ChooseYourPlan')}</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan" suppressHydrationWarning>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">{t('FreePlan')}</SelectItem>
                  <SelectItem value="VIP">{t('VipPlan')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" suppressHydrationWarning>{t('EmailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" suppressHydrationWarning>{t('PasswordLabel')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-code" suppressHydrationWarning>{t('AdminCodeLabel')}</Label>
              <Input
                id="admin-code"
                type="text"
                placeholder={t('AdminCodePlaceholder')}
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('CreateAccountButton')}
            </Button>
          </form>
        </CardContent>
        <div className="mt-4 p-6 pt-0 text-center text-sm" suppressHydrationWarning>
          {t('AlreadyHaveAccount')}{' '}
          <Link to="/auth/login" className="underline text-primary" suppressHydrationWarning>
            {t('LogIn')}
          </Link>
        </div>
      </Card>
    </div>
  );
}

