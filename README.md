# FormBee

Form submissions to email made easy.

Recieve form data on your email without writing a single line of server side code.

Optionally you can return a reply email to the sender.

# TODO:
- [] Formbee landing site
    - [] Hive background similar to how people have done a grid background thats subtle.
- [] Optional Captcha
    - [] implement ALCHA for captcha (self hosting to not make the user have to implement this themselves)
    - [] Add source code for many different captcha options.
    - [] Point out that traditional captcha's work based off of harvested data from the user's browser.
    - [] Check legality of pointing out the shadiness of Googles reCaptcha
- [] User API keys w/ rate limiting
    - [] Seperate API usage for localhost, so users can test without wasting API usage.
- [] Login auth
    - [] Github login only I think is the route I want to go.
- [] Admin page for managing account and subscription
    - [] Toggle in admin panel for adding website URL for CORS to only allow requests from the clients domain.
- [] Subscription plans, inplemented with stripe.
    - $5, 250 API calls per month.