package br.com.springjpa.ecommerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImagem(MultipartFile arquivo) throws IOException {
        // Envia o arquivo para a nuvem
        Map uploadResult = cloudinary.uploader().upload(arquivo.getBytes(), ObjectUtils.emptyMap());

        // Pega a URL segura que a nuvem gerou e devolve para usarmos no banco de dados!
        return uploadResult.get("secure_url").toString();
    }
}
