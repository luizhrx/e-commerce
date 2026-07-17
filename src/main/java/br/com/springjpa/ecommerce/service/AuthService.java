package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.LoginRequestDTO;
import br.com.springjpa.ecommerce.dto.request.RegistroRequestDTO;
import br.com.springjpa.ecommerce.dto.response.LoginResponseDTO;
import br.com.springjpa.ecommerce.dto.response.UsuarioLoginDTO;
import br.com.springjpa.ecommerce.enums.RoleEnum;
import br.com.springjpa.ecommerce.infra.config.JwtService;
import br.com.springjpa.ecommerce.infra.exception.EntidadeJaCadastrada;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.model.RoleEntity;
import br.com.springjpa.ecommerce.model.UsuarioEntity;
import br.com.springjpa.ecommerce.repository.RoleRepository;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final UserDetailsService  userDetailsService;

    public String registrar(RegistroRequestDTO dto){
        if (usuarioRepository.findByEmail(dto.email()).isPresent()){
            throw new EntidadeJaCadastrada("Usuário já cadastrado com o email: " + dto.email());
        }

        var usuario = new UsuarioEntity();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        RoleEntity role = roleRepository.findByNome(RoleEnum.ROLE_USER)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Role não encontrada"));

        usuario.setRole(role);

        usuarioRepository.save(usuario);

        return jwtService.gerarToken(usuario);
    }

    public LoginResponseDTO login(LoginRequestDTO dto){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.senha())
        );

        var usuario = (UsuarioEntity) userDetailsService.loadUserByUsername(dto.email());

        var token = jwtService.gerarToken(usuario);

        String role = usuario.getRole() != null && usuario.getRole().getNome() != null
                ? usuario.getRole().getNome().name().replaceFirst("^ROLE_", "")
                : null;

        var usuarioLoginDto = new UsuarioLoginDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                role
        );

        return new LoginResponseDTO(token, usuarioLoginDto);
    }
}
