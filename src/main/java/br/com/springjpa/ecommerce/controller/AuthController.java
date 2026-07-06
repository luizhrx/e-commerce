package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.LoginRequestDTO;
import br.com.springjpa.ecommerce.dto.request.RegistroRequestDTO;
import br.com.springjpa.ecommerce.dto.response.LoginResponseDTO;
import br.com.springjpa.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

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
}
