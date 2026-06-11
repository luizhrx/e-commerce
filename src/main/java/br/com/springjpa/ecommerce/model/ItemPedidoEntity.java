package br.com.springjpa.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedidoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private BigDecimal precoUnitario;

    @ManyToOne
    @JoinColumn(name = "pedido_id",nullable = false)
    private PedidoEntity pedido; // Vários itens de pedido para um pedido

    @ManyToOne
    @JoinColumn(name = "produto_id",nullable = false)
    private ProdutoEntity produto; // Vários itens de pedido para um produto
}
