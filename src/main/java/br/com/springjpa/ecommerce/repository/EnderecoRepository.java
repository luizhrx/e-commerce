package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.EnderecoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnderecoRepository extends JpaRepository<EnderecoEntity, Long> {

    // Todos os endereços de um usuário
    List<EnderecoEntity> findByUsuarioId(Long usuarioId);

    // Endereços de um usuário em uma cidade específica
    // Corrija para:
    List<EnderecoEntity> findByUsuarioIdAndCidade(Long usuarioId, String cidade);

    // Verifica se um usuário possui endereços cadastrados
    boolean existsByUsuarioId(Long usuarioId);

    //Busca um endereço específico do usuário combinando CEP e Número da casa
    Optional<EnderecoEntity> findByUsuarioIdAndCepAndNumero(Long usuarioId, String cep, String numero);
}
