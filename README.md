# E2E Tests

End-to-end testing suite for the agentic AI system.

## Overview

This directory contains automated end-to-end (E2E) tests that validate the complete flow of the agentic AI system.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Running Tests

Run all E2E tests:

```bash
npm run test:e2e
```

Run tests in watch mode:

```bash
npm run test:e2e:watch
```

## Test Structure

```
├── tests/
│   ├── integration/
│   ├── api/
│   └── workflows/
├── fixtures/
├── utils/
└── config/
```

## Contributing

Please ensure all E2E tests pass before submitting pull requests.