package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.ItemPedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemPedidoRepository extends JpaRepository<ItemPedidoEntity, Long> {

     // Itens de um pedido específico
     List<ItemPedidoEntity> findByPedidoId(Long pedidoId);

     // Itens de um produto específico
     List<ItemPedidoEntity> findByProdutoId(Long produtoId);

     // verifica se produto está em algum pedido
     boolean existsByProdutoId(Long produtoId);
}
