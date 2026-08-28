package com.EMP_Management_COMP.ManageByHR.Security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenKillingService {

    private final Set<String> blockedTokens = ConcurrentHashMap.newKeySet();

    public void blockTokenProcess(String token) {
        blockedTokens.add(token);
    }

    public boolean isBlockedToken(String token) {
        return blockedTokens.contains(token);
    }
}
