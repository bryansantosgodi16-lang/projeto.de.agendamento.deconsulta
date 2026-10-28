package com.projeto.service;

import com.projeto.dto.LoginRequest;
import com.projeto.dto.RegistroRequest;
import com.projeto.dto.UsuarioResponse;
import com.projeto.model.Usuario;
import com.projeto.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
@Transactional
public class AuthService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    public UsuarioResponse registrar(RegistroRequest dados, HttpServletRequest request, HttpServletResponse response) {
        String email = dados.email().trim().toLowerCase();
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta com esse e-mail.");
        }
        Usuario usuario = usuarios.save(new Usuario(dados.nome().trim(), email, passwordEncoder.encode(dados.senha())));
        autenticar(email, dados.senha(), request, response);
        return UsuarioResponse.from(usuario);
    }

    public UsuarioResponse entrar(LoginRequest dados, HttpServletRequest request, HttpServletResponse response) {
        String email = dados.email().trim().toLowerCase();
        autenticar(email, dados.senha(), request, response);
        Usuario usuario = usuarios.findByEmailIgnoreCase(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
        return UsuarioResponse.from(usuario);
    }

    private void autenticar(String email, String senha, HttpServletRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, senha));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);
        } catch (BadCredentialsException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
        }
    }
}
