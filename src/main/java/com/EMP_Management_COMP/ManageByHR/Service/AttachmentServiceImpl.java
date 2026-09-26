package com.EMP_Management_COMP.ManageByHR.Service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.EMP_Management_COMP.ManageByHR.Cloud.CloudStoragePath;

@Service
public class AttachmentServiceImpl implements AttachmentService {
	
	@Autowired
	private CloudStoragePath cloudStorage;
	
	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	private static final List<String> ALLOWED_TYPES = Arrays.asList("image/png", "image/jpeg", "image/jpg", "image/webp");
	
	@Override
	public String uploadPhoto(MultipartFile file, String folder) {
		// Validate file
		validateFile(file);
		
		// Upload to Cloudinary and return URL
		return cloudStorage.store(file, folder);
	}
	
	@Override
	public void deletePhoto(String cloudId) {
		if (cloudId != null && !cloudId.isEmpty()) {
			try {
				cloudStorage.deleteFile(cloudId);
			} catch (Exception e) {
				// Log but don't fail if deletion fails
				System.err.println("Warning: Could not delete cloud file: " + e.getMessage());
			}
		}
	}
	
	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("File cannot be empty");
		}
		
		if (file.getSize() > MAX_FILE_SIZE) {
			throw new RuntimeException("File size exceeds maximum of 10MB");
		}
		
		if (!ALLOWED_TYPES.contains(file.getContentType())) {
			throw new RuntimeException("Invalid file format. Only PNG, JPEG, JPG, and WebP are allowed");
		}
	}
}
