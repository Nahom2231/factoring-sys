package com.fiep.factoring_sys;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"security.jwt.secret=test-only-signing-key-for-fiep-automated-tests"
})
class FactoringSysApplicationTests {

	@Test
	void contextLoads() {
	}
}
