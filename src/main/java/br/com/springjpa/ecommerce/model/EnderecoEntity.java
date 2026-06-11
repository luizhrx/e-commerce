package br.com.springjpa.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnderecoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rua;

    @Column(nullable = false)
    private String numero;

    private String complemento;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String estado;

    @Column(nullable = false, length = 8)
    private String cep;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario; // Varios endereços para um usuário

    // Método para converter EnderecoEntity para Endereco
    public Endereco toEndereco() {
        return new Endereco(this.rua, this.numero, this.complemento,
                this.bairro, this.cidade, this.estado, this.cep);
    }

    // Método para converter Endereco para EnderecoEntity
    public static EnderecoEntity fromEndereco(Endereco endereco, UsuarioEntity usuario) {
        EnderecoEntity entity = new EnderecoEntity();
        entity.setRua(endereco.getRua());
        entity.setNumero(endereco.getNumero());
        entity.setComplemento(endereco.getComplemento());
        entity.setBairro(endereco.getBairro());
        entity.setCidade(endereco.getCidade());
        entity.setEstado(endereco.getEstado());
        entity.setCep(endereco.getCep());
        entity.setUsuario(usuario);
        return entity;
    }

}
