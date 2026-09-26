package com.EMP_Management_COMP.ManageByHR.Service;

import org.springframework.web.multipart.MultipartFile;

public interface AttachmentService {
	public String uploadPhoto(MultipartFile file, String folder);
	public void deletePhoto(String cloudId);
}
