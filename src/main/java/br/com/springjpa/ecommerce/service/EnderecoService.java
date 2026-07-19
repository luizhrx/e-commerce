package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.EnderecoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.EnderecoResponseDTO;
import br.com.springjpa.ecommerce.infra.config.SecurityUtils;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.model.Endereco;
import br.com.springjpa.ecommerce.model.EnderecoEntity;
import br.com.springjpa.ecommerce.model.UsuarioEntity;
import br.com.springjpa.ecommerce.repository.EnderecoRepository;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;

    // Método para listar todos os endereços
    @Transactional(readOnly = true)
    public List<EnderecoResponseDTO> listarTodosEnderecos() {
        return enderecoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar endereços por usuário
    @Transactional(readOnly = true)
    public List<EnderecoResponseDTO> listarEnderecosPorUsuario(Long usuarioId) {
        securityUtils.verificarProprietario(usuarioId);

        return enderecoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar endereços de um usuário em uma cidade específica
    @Transactional(readOnly = true)
    public List<EnderecoResponseDTO> listarEnderecosPorUsuarioECidade(Long usuarioId, String cidade) {
        securityUtils.verificarProprietario(usuarioId);

        return enderecoRepository.findByUsuarioIdAndCidade(usuarioId, cidade).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para criar um novo endereço para um usuário
    public EnderecoResponseDTO criarEndereco(Long usuarioId, EnderecoRequestDTO dto) {
        securityUtils.verificarProprietario(usuarioId);

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado com ID: " + usuarioId));

        Optional<EnderecoEntity> enderecoExistente = enderecoRepository.findByUsuarioIdAndCepAndNumero(usuarioId, dto.cep(), dto.numero());

        if (enderecoExistente.isPresent()){
            return  toResponseDTO(enderecoExistente.get());
        }

        var endereco = new EnderecoEntity();
        endereco.setRua(dto.rua());
        endereco.setNumero(dto.numero());
        endereco.setComplemento(dto.complemento());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        endereco.setEstado(dto.estado());
        endereco.setCep(dto.cep());
        endereco.setUsuario(usuario);

        var savedEndereco = enderecoRepository.save(endereco);
        return toResponseDTO(savedEndereco);

    }

    // Método para atualizar um endereço existente
    public EnderecoResponseDTO atualizarEndereco(Long enderecoId, EnderecoRequestDTO dto) {
        securityUtils.verificarProprietario(enderecoId);

        var enderecoEntity = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Endereço não encontrado com ID: " + enderecoId));

        enderecoEntity.setRua(dto.rua());
        enderecoEntity.setNumero(dto.numero());
        enderecoEntity.setComplemento(dto.complemento());
        enderecoEntity.setBairro(dto.bairro());
        enderecoEntity.setCidade(dto.cidade());
        enderecoEntity.setEstado(dto.estado());
        enderecoEntity.setCep(dto.cep());

        EnderecoEntity enderecoNovo = enderecoRepository.save(enderecoEntity);
        return toResponseDTO(enderecoNovo);

    }

    // Método para excluir um endereço
    public void excluirEndereco(Long id){
        var endereco = enderecoRepository.findById(id)
                .orElseThrow(()-> new EntidadeNaoEncontrada("Endereço não encontrado com ID: " + id));

        enderecoRepository.delete(endereco);
    }

    private EnderecoResponseDTO toResponseDTO(EnderecoEntity dto){
            return new EnderecoResponseDTO(
                    dto.getId(),
                    dto.getRua(),
                    dto.getNumero(),
                    dto.getComplemento(),
                    dto.getBairro(),
                    dto.getCidade(),
                    dto.getEstado(),
                    dto.getCep(),
                    dto.getUsuario().getNome()
            );
    }
}
