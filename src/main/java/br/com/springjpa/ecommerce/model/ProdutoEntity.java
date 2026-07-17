package br.com.springjpa.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(nullable = false)
    private Integer quantidadeStock;

    private String imagem;

    @ManyToOne()
    @JoinColumn(name = "categoria_id",nullable = false)
    private CategoriaEntity categoria; //Vários produtos para uma categoria

    @OneToMany(mappedBy = "produto",fetch = FetchType.LAZY)
    private List<ItemPedidoEntity> itens = new ArrayList<>(); // Um produto pode estar em vários itens de pedido
}
