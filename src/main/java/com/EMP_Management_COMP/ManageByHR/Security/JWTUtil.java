package com.EMP_Management_COMP.ManageByHR.Security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.EMP_Management_COMP.ManageByHR.ENUM.Permissions;
import com.EMP_Management_COMP.ManageByHR.Entity.UserAuth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

    private final Key key;
    private final long validateTime = 12 * 60 * 60 * 1000L;

    public JWTUtil() {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isEmpty()) {
            secret = "Replace this place with some secret key";
        }

        key = Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(UserAuth user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("Role", user.getRole().name());

        Set<Permissions> perm =
                RoleBasedPermissions.getRoleBasedPermissions().get(user.getRole());

        Date now = new Date();
        Date expire = new Date(now.getTime() + validateTime);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUserEmail())
                .setIssuedAt(now)
                .setExpiration(expire)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
    public Claims getClaim(String token) {
    	return Jwts
    			.parserBuilder()
    			.setSigningKey(key)
    			.build()
    			.parseClaimsJws(token)
    			.getBody();
    }
    public String getUserEmail(String token) {
    	return getClaim(token).getSubject();
    }

    public String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

  }
