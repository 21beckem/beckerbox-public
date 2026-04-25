export interface UUIDResponse {
    uuid: string;
    timestamp: number;
}

export const UUID = new class {
    constructor() {
        window.UUID = this;
        setInterval(() => {
            const pair = this.getEnsuredValidPair();
            this.persist(pair);
        }, 5000);
    }
    private generate(): UUIDResponse {
        return {
            uuid: crypto.randomUUID(),
            timestamp: Date.now()
        };
    }
    private getFromStorage(): UUIDResponse | null {
        const item = localStorage.getItem('remoteUUID');
        if (!item) return null; // No UUID stored

        let parsed;
        try {
            parsed = JSON.parse(item);
        } catch {
            return null; // Invalid JSON, treat as no UUID
        }
        if (typeof parsed.uuid !== 'string' || typeof parsed.timestamp !== 'number') {
            return null; // Invalid structure, treat as no UUID
        }
        return {
            uuid: parsed.uuid,
            timestamp: parsed.timestamp
        };
    }
    private persist(pair: UUIDResponse): void {
        localStorage.setItem('remoteUUID', JSON.stringify({ uuid: pair.uuid, timestamp: Date.now() }));
    }
    private getEnsuredValidPair(): UUIDResponse {
        let pair = this.getFromStorage();
        if (pair === null) {
            pair = this.generate();
        }
        return pair;
    }
    get(): UUIDResponse {
        const pair = this.getEnsuredValidPair();
        this.persist(pair); // Update timestamp on each get
        return pair;
    }
    clear(): void {
        localStorage.removeItem('remoteUUID');
    }
}