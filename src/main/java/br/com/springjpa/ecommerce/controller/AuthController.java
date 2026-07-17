package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.LoginRequestDTO;
import br.com.springjpa.ecommerce.dto.request.RegistroRequestDTO;
import br.com.springjpa.ecommerce.dto.response.LoginResponseDTO;
import br.com.springjpa.ecommerce.dto.response.UsuarioLoginDTO;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import br.com.springjpa.ecommerce.service.AuthService;
import br.com.springjpa.ecommerce.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@RequestBody @Valid RegistroRequestDTO dto){
        var registro = authService.registrar(dto);
        return ResponseEntity.ok(registro);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto){
        var login = authService.login(dto);
        return ResponseEntity.ok(login);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioLoginDTO> obterUsuarioLogado(Authentication authentication) {
        String email = authentication.getName();
        var usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado"));

        String role = usuarioEntity.getRole() != null && usuarioEntity.getRole().getNome() != null
                ? usuarioEntity.getRole().getNome().name().replaceFirst("^ROLE_", "")
                : null;

        var usuarioLoginDto = new UsuarioLoginDTO(
                usuarioEntity.getId(),
                usuarioEntity.getNome(),
                usuarioEntity.getEmail(),
                role
        );

        return ResponseEntity.ok(usuarioLoginDto);
    }
}
