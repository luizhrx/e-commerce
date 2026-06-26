package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.Endereco;
import br.com.springjpa.ecommerce.model.EnderecoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<EnderecoEntity, Long> {

    // Todos os endereços de um usuário
    List<EnderecoEntity> findByUsuarioId(Long usuarioId);

    // Endereços de um usuário em uma cidade específica
    // Corrija para:
    List<EnderecoEntity> findByUsuarioIdAndCidade(Long usuarioId, String cidade);

    // Verifica se um usuário possui endereços cadastrados
    boolean existsByUsuarioId(Long usuarioId);
}
