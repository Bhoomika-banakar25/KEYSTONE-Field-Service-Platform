package com.EMP_Management_COMP.ManageByHR.Cloud;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Component
public class CloudinaryStorage implements CloudStoragePath {
	
	@Autowired
	private Cloudinary cloudinary;
	
	@Override
	public String store(MultipartFile file, String folder) {
		try {
			// Upload to Cloudinary with folder structure
			Map uploadResult = cloudinary.uploader().upload(
				file.getBytes(),
				ObjectUtils.asMap(
					"folder", "keystone/" + folder,
					"resource_type", "auto",
					"public_id", UUID.randomUUID().toString()
				)
			);
			
			// Return the secure URL from Cloudinary
			return uploadResult.get("secure_url").toString();
			
		} catch (Exception e) {
			throw new RuntimeException("Failed to upload file to cloud: " + e.getMessage(), e);
		}
	}
	
	@Override
	public byte[] read(String storagePath) {
		try {
			// This would require downloading from the URL
			// For now, return empty as we serve via URL redirect
			return new byte[0];
		} catch (Exception e) {
			throw new RuntimeException("Failed to read file from cloud: " + e.getMessage(), e);
		}
	}
	
	@Override
	public void deleteFile(String cloudId) {
		try {
			cloudinary.uploader().destroy(cloudId, ObjectUtils.emptyMap());
		} catch (Exception e) {
			throw new RuntimeException("Failed to delete file from cloud: " + e.getMessage(), e);
		}
	}
}
