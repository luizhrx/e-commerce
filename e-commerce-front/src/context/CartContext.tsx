import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Produto } from '../services/produtoService';

// Interface do item do carrinho que estende o Produto adicionando a quantidade selecionada pelo cliente
export interface CartItem extends Produto {
  quantidadeSelecionada: number;
}

// Interface que define a estrutura do contexto do Carrinho
interface CartContextData {
  cartItems: CartItem[];
  adicionarAoCarrinho: (produto: Produto, quantidade: number) => void;
  removerDoCarrinho: (produtoId: number) => void;
  atualizarQuantidade: (produtoId: number, novaQuantidade: number) => void;
  limparCarrinho: () => void;
  valorTotal: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('@CoreX:cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  // Salva os dados no localStorage sempre que o carrinho sofrer alterações
  useEffect(() => {
    localStorage.setItem('@CoreX:cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Função para adicionar um produto ao carrinho
  const adicionarAoCarrinho = (produto: Produto, quantidade: number) => {
    setCartItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === produto.id);

      if (itemExistente) {
        // Garante que não ultrapasse a quantidade disponível em estoque
        const novaQtd = Math.min(
          itemExistente.quantidadeSelecionada + quantidade,
          produto.quantidadeStock
        );
        return prevItems.map((item) =>
          item.id === produto.id ? { ...item, quantidadeSelecionada: novaQtd } : item
        );
      }

      // Adiciona o novo item se houver estoque disponível
      const quantidadeInicial = Math.min(quantidade, produto.quantidadeStock);
      if (quantidadeInicial <= 0) return prevItems;

      return [...prevItems, { ...produto, quantidadeSelecionada: quantidadeInicial }];
    });
  };

  // Função para remover um produto do carrinho pelo ID
  const removerDoCarrinho = (produtoId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== produtoId));
  };

  // Função para atualizar a quantidade selecionada de um item específico
  const atualizarQuantidade = (produtoId: number, novaQuantidade: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === produtoId) {
            // Garante o respeito aos limites (mínimo 1, máximo estoque)
            const qtdValida = Math.max(1, Math.min(novaQuantidade, item.quantidadeStock));
            return { ...item, quantidadeSelecionada: qtdValida };
          }
          return item;
        })
        .filter((item) => item.quantidadeSelecionada > 0);
    });
  };

  // Limpa o carrinho por completo
  const limparCarrinho = () => {
    setCartItems([]);
  };

  // Cálculo dinâmico do valor total acumulado no carrinho
  const valorTotal = cartItems.reduce(
    (acumulador, item) => acumulador + item.preco * item.quantidadeSelecionada,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        adicionarAoCarrinho,
        removerDoCarrinho,
        atualizarQuantidade,
        limparCarrinho,
        valorTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
}
