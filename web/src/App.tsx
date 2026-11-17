import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loading } from './components/ui';
import { useAuth } from './context/AuthContext';
import { AccountDetail } from './pages/AccountDetail';
import { BillPay } from './pages/BillPay';
import { CardDetail } from './pages/CardDetail';
import { Cards } from './pages/Cards';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Rewards } from './pages/Rewards';
import { Transfer } from './pages/Transfer';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="accounts/:id" element={<AccountDetail />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="cards" element={<Cards />} />
        <Route path="cards/:id" element={<CardDetail />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="bill-pay" element={<BillPay />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
