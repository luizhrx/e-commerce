import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import Login from '../pages/Login/Login';
import Registro from '../pages/Registro/Registro';
import Home from '../pages/Home/Home';
import ProdutoDetalhe from '../pages/ProdutoDetalhe/ProdutoDetalhe';
import Carrinho from '../pages/Carrinho/Carrinho';
import Checkout from '../pages/Checkout/Checkout';
import MeusPedidos from '../pages/MeusPedidos/MeusPedidos';

import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Admin/Dashboard/Dashboard';
import CategoriasAdmin from '../pages/Admin/Categorias/CategoriasAdmin';
import ProdutosAdmin from '../pages/Admin/Produtos/ProdutosAdmin';
import PedidosAdmin from '../pages/Admin/Pedidos/PedidosAdmin';

function RotaPrivada({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // Exige token E identidade carregada: um token órfão no localStorage (sessão
  // parcialmente limpa) não pode liberar telas que dependem de `user.id`.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RotaAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
    <Toaster theme="dark" richColors position="top-right" />
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/" element={<RotaPrivada><Home /></RotaPrivada>} />
          <Route path="/produto/:id" element={<RotaPrivada><ProdutoDetalhe /></RotaPrivada>} />
          <Route path="/carrinho" element={<RotaPrivada><Carrinho /></RotaPrivada>} />
          <Route path="/checkout" element={<RotaPrivada><Checkout /></RotaPrivada>} />
          <Route path="/pedidos" element={<RotaPrivada><MeusPedidos /></RotaPrivada>} />

          <Route path="/admin" element={<RotaAdmin><AdminLayout /></RotaAdmin>}>
            <Route index element={<Dashboard />} />
            <Route path="categorias" element={<CategoriasAdmin />} />
            <Route path="produtos" element={<ProdutosAdmin />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}