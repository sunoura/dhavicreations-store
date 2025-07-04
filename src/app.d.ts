declare global {
	namespace App {
		interface Locals {
			admin?: import('$lib/server/auth').AuthAdmin | null;
		}
	}
}

export {};
