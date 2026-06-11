package br.com.springjpa.ecommerce.model;

import br.com.springjpa.ecommerce.enums.StatusPedido;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp  // Garante que a data de criação seja definida automaticamente
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime  dataCriacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.PENDENTE;

    // Método para calcular o valor total do pedido
    public BigDecimal getValorTotal(){
        return itens.stream()
                .map(i -> i.getPrecoUnitario()
                        .multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO,BigDecimal::add);
    }

    // Endereço de entrega embutido no pedido
    @AttributeOverrides({
            @AttributeOverride(name = "rua",        column = @Column(name = "entrega_rua")),
            @AttributeOverride(name = "numero",     column = @Column(name = "entrega_numero")),
            @AttributeOverride(name = "complemento",column = @Column(name = "entrega_complemento")),
            @AttributeOverride(name = "bairro",     column = @Column(name = "entrega_bairro")),
            @AttributeOverride(name = "cidade",     column = @Column(name = "entrega_cidade")),
            @AttributeOverride(name = "estado",     column = @Column(name = "entrega_estado")),
            @AttributeOverride(name = "cep",        column = @Column(name = "entrega_cep"))
    })
    @Embedded
    private Endereco enderecoEntrega;

    @ManyToOne
    @JoinColumn(name = "usuario_id",nullable = false)
    private UsuarioEntity usuario; // Varios pedidos para um usuário

    @OneToMany(mappedBy = "pedido",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<ItemPedidoEntity> itens = new ArrayList<>(); // Um pedido pode ter vários itens Pedidos

    // Método para adicionar um item ao pedido, garantindo a consistência da relação bidirecional
    public void adicionarItem(ItemPedidoEntity item){
        this.itens.add(item);
        item.setPedido(this);
    }

}
