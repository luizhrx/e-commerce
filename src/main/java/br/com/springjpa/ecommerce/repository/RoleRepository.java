package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.enums.RoleEnum;
import br.com.springjpa.ecommerce.model.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleEntity, Long> {

    Optional<RoleEntity> findByNome(RoleEnum nome);
}
