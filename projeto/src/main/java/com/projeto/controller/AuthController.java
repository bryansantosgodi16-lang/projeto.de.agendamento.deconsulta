package com.projeto.controller;

import com.projeto.dto.LoginRequest;
import com.projeto.dto.RegistroRequest;
import com.projeto.dto.UsuarioResponse;
import com.projeto.repository.UsuarioRepository;
import com.projeto.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UsuarioRepository usuarios;

    public AuthController(AuthService auth, UsuarioRepository usuarios) {
        this.auth = auth;
        this.usuarios = usuarios;
    }

    @PostMapping("/register")
    public UsuarioResponse registrar(@Valid @RequestBody RegistroRequest dados,
            HttpServletRequest request, HttpServletResponse response) {
        return auth.registrar(dados, request, response);
    }

    @PostMapping("/login")
    public UsuarioResponse entrar(@Valid @RequestBody LoginRequest dados,
            HttpServletRequest request, HttpServletResponse response) {
        return auth.entrar(dados, request, response);
    }

    @GetMapping("/me")
    public UsuarioResponse atual(Authentication authentication) {
        return usuarios.findByEmailIgnoreCase(authentication.getName()).map(UsuarioResponse::from)
                .orElseThrow();
    }

    @PostMapping("/logout")
    public void sair(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }
}
