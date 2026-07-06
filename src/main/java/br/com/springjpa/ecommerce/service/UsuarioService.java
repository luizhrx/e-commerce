package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.UsuarioRequestDTO;
import br.com.springjpa.ecommerce.dto.response.UsuarioResponseDTO;
import br.com.springjpa.ecommerce.infra.exception.EntidadeJaCadastrada;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.model.UsuarioEntity;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Método para listar todos os usuários
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuarios(){
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .toList(); 
    }

    // Método para buscar um usuário por ID
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarUsuarioPorId(Long id){
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado"));

        return toResponseDto(usuario);
    }

    // Método para buscar um usuário por email
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarUsuarioPorEmail(String email){
        var usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado"));

        return toResponseDto(usuario);
    }

    // Método para buscar usuários por nome (contendo, ignorando maiúsculas/minúsculas)
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> buscarUsuariosPorNome(String nome){
        return usuarioRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    // Método para atualizar um usuário existente
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioRequestDTO dto){
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado"));

        if(!usuario.getEmail().equals(dto.email()) && usuarioRepository.existsByEmail(dto.email())){
            throw new EntidadeJaCadastrada("Email já cadastrado");
        }

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        var usuarioAtualizado = usuarioRepository.save(usuario);
        return toResponseDto(usuarioAtualizado);
    }

    // Método para deletar um usuário por ID
    public void deletarUsuario(Long id){
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado"));

        usuarioRepository.delete(usuario);
    }

    private UsuarioResponseDTO toResponseDto(UsuarioEntity usuario){
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }
}
