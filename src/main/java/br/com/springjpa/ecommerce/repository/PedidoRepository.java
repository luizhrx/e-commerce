package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {

    // Todos os pedidos de um usuário
    List<PedidoEntity> findByUsuarioId(Long usuarioId);

    // Pedidos com um status específico
    List<PedidoEntity> findByStatus(String status);

    // Pedidos de um usuário com um status específico
    List<PedidoEntity> findByUsuarioIdAndStatus(Long usuarioId, String status);

    // Pedidos em um período específico
    List<PedidoEntity> findByDataPedidoBetween(LocalDateTime inicio, LocalDateTime fim);

    //Pedidos de uma usuario ordenados por data
    List<PedidoEntity> findByUsuarioIdOrderByDataPedidoDesc(Long usuarioId);

    // Contagem de pedidos por status
    long countByStatus(String status);
}
