package com.EMP_Management_COMP.ManageByHR.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.EMP_Management_COMP.ManageByHR.Service.AttachmentService;

@RestController
@RequestMapping("/api/attachment")
public class AttachmentController {
	
	@Autowired
	private AttachmentService attachmentService;
	
	@PostMapping("/upload")
	public ResponseEntity<?> uploadPhoto(
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "folder", defaultValue = "photos") String folder) {
		try {
			String photoUrl = attachmentService.uploadPhoto(file, folder);
			return ResponseEntity.ok(new PhotoUploadResponse(photoUrl));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ErrorResponse("Upload failed: " + e.getMessage()));
		}
	}
	
	@DeleteMapping("/delete")
	public ResponseEntity<?> deletePhoto(@RequestParam("cloudId") String cloudId) {
		try {
			attachmentService.deletePhoto(cloudId);
			return ResponseEntity.ok(new SuccessResponse("Photo deleted successfully"));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ErrorResponse("Delete failed: " + e.getMessage()));
		}
	}
	
	// Simple DTO classes for responses
	public static class PhotoUploadResponse {
		public String photoUrl;
		
		public PhotoUploadResponse(String photoUrl) {
			this.photoUrl = photoUrl;
		}
		
		public String getPhotoUrl() {
			return photoUrl;
		}
	}
	
	public static class SuccessResponse {
		public String message;
		
		public SuccessResponse(String message) {
			this.message = message;
		}
		
		public String getMessage() {
			return message;
		}
	}
	
	public static class ErrorResponse {
		public String error;
		
		public ErrorResponse(String error) {
			this.error = error;
		}
		
		public String getError() {
			return error;
		}
	}
}
