# Fullstack Development Guide

This file contains high level development guides spanning across backend and frontend. These guides also include notes on how to utilize AI code assistants.

> [!TODO]
> Read through relevant readmes first: READMEs under [/backend/README.md](/backend/README.md) and [/frontend/README.md](/frontend/README.md) folders.

## What does this repo come with?

This template provides the following basic web application flow:
* Two [user roles](/backend/src/domain/enums.ts): USER and ADMIN 
* A User and Application models: [table schemas](/backend/prisma/schema.prisma), [domain types](/backend/src/domain/types.ts)
* [Password based authentication](/backend/src/service/authService.ts)
* [Cookie based sessions](/backend/src/api/plugins/userAuth.ts)
* Simple AI assistant chat

A User can:
* Login
* View their applications and their status
* Submit a new application

An Admin can:
* Login
* View applications under review
* Approve or deny applications

## Getting ready for your project

TODO
1. Remove db models that are not needed
1. Update your user roles
1. Remove or upgrade design systems
1. Adjust header and footer

## Design System Choice

We use USWDS as our design system of choice.

TODO Install MCP

### Use another design system

TODO

## AI/LLM Assisted Fullstack Feature Development

We will use the benefit application flow that is part of this template as a guide to developing a feature that has UI backed by API endpoints. This example will illustrate the changes you will need to make when developing a fullstack feature (backend and frontend). We will use **AI prompts** to demonstrate the steps we recommend for developing features.

### 1. Create the enums, table, and types;
```prompt
We will now add an leave benefit Application flow, let's start with the backend:
- Add a LeaveType: ChildBirthRecovery, ChildBirthBonding, AdoptionBonding, FosterCareBonding, SeriousIllness, SeriousSurgery, Caregiver, MilitaryCaregiver
- Add ApplicationStatus: UNDER_REVIEW, APPROVED, DENIED, WITHDRAWN
- Add a Application table and types: leaveType, startDate, endDate (optional)
- Add the relevant schema updates, domain types, repo file
- hold off on routes, services, tests, and zod schema files
```

Resulting changes:
- Updated: [`/backend/prisma/schema.prisma`](/backend/prisma/schema.prisma)
- Updated: [`/backend/src/domain/enums.ts`](/backend/src/domain/enums.ts) and [`/backend/src/domain/types.ts`](/backend/src/domain/types.ts)
- Created: [`/backend/src/repo/applicationRepo.ts`](/backend/src/repo/applicationRepo.ts)

### 2. Add service, API routes, and tests

```prompt
- Let's now add a service with functions submit, getApplications, adjudicate, and withdraw
- Add routes that correspond to service functions: submission and withdrawal have to be by a USER role, listing should get own applications for USER, or applications with status UNDER_REVIEW for ADMIN users, adjudication is for ADMINs only
- Follow existing patterns, for example role based authorization should live in routers
- Add swagger / openAPI documentation on each route, create relevant schemas under src/api/docs
- Create route tests, follow existing pattern and test the application submission, adjudication, and withdrawal flows by role described above
```

Resulting changes:
- Updated: [`/backend/src/repo/applicationRepo.ts`](/backend/src/repo/
- Created: [`/backend/src/service/applicationService.ts](/backend/src/service/applicationService.ts)
- Created: [`/backend/src/api/routes/application-routes.ts`](/backend/src/api/routes/application-routes.ts)
- Updated: [`/backend/src/server.ts`](/backend/src/server.ts)
- Created: [`/backend/tests/routes/application-routes.test.ts`](/backend/tests/routes/application-routes.test.ts)

### 3. Create the frontend application flow UI

```prompt
- Let's now create the frontend. Create a page at path /applications to list Pending Applications (with status UNDER_REVIEW), and then Closed Applications in two tables. Pending Applications table should have an actions column, USER should be able to withdraw, and ADMIN should be able to approve or deny.
- There should be a New Application button at the top that shows an application form in line when clicked to submit a new application (only for USER roles)
- Make sure to create the relevant types and enums to reflect expected responses from the backend
- Follow existing patters to create the relevant api calls, and wrapping queries
- Follow existing UI patterns on other pages
- Hold off on tests
```

Resulting changes:
- Updated: [`/frontend/src/shared/domain/types.ts`](/frontend/src/shared/domain/types.ts) and [`/frontend/src/shared/domain/enums.ts`](/frontend/src/shared/domain/enums.ts)
- Created: [`/frontend/src/shared/api/application-api.ts`](/frontend/src/shared/api/application-api.ts)
- Created: [`/frontend/src/shared/hooks/application-queries.ts`](/frontend/src/shared/hooks/application-queries.ts)
- Created: [`/frontend/src/pages/applications/applications-page.tsx`](/frontend/src/pages/applications/applications-page.tsx)
- Updated: [`/frontend/src/app/router.tsx`](/frontend/src/app/router.tsx)
- Updated: [`/frontend/src/app/components/header.tsx`](/frontend/src/app/components/header.tsx)

### 4. Custom prompts to fix UI
At this point you will usually need additional prompts to adjust any UI to desired structure and look i.e. move button under title, make button yellow

### 5. Create the frontend tests
```prompt
- add a frontend test file for the applications page to test the apply, adjudicate, withdraw flow (including denial by ADMIN)
- test the table listing for each
- use existing test patterns, test the full flow with one set of test data in one file
```

Resulting changes:
- Created: [`/frontend/tests/applications-page.test.tsx`](/frontend/tests/applications-page.test.tsx)

### 6. Iterate on your tests
Tests are your protection against regressions during future development. Make sure to go line by line through your new test file and make any necessary adjustments.

## Adding a New Feature

Please refer to `Initial Development` section above. Your changes will be the relevant  subset detailed in that section.

## Updating Existing Features

Please refer to `Initial Development` section above. Your changes will be the relevant  subset detailed in that section.

## Updating your Design System

This repo currently supports the [USWDS](https://designsystem.digital.gov/) design system (specifically the [react implementation](https://github.com/trussworks/react-uswds))

To swap out your design system to another government design system, for example a state level design system like [Mayflower](https://mayflower.digital.mass.gov/core/index.html?path=/docs/overview-introduction--page)), or to another open source / commercial design system:

1. install the relevant library using `yarn`, follow any instructions for setting it up (top level css, [providers](/frontend/src/app/providers.tsx) etc)
1. if your design system has an MCP, make sure to configure it for your LLM tool
1. search for USWDS in [README](/frontend/README.md) and [AGENTS](/frontend/AGENTS.md) files and update to your library
1. Use the following prompt to make updates, **ALL frontend tests should STILL pass** after changes.

```
Update the following files from using USWDS components to <name-of-your-design-system> components to build the UI. Preserve as much of the structure and intent of the UI as possible.

- /frontend/src/app/components.tsx
- /frontend/src/app/layout.tsx
- /frontend/src/pages/auth/login-page.tsx
- /frontend/src/pages/home/home-page.tsx
- /frontend/src/pages/applications/applications-page.tsx
- /frontend/src/pages/not-found-page.tsx
```