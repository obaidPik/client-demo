const getEnvironmentVariable = (environmentVariable: string): string => {
  console.log('***********',process.env.NEXT_PUBLIC_API_URL)
    const unvalidatedEnvironmentVariable = process.env[environmentVariable];
    if (!unvalidatedEnvironmentVariable) {
      throw new Error(
        `Couldn't find environment variable: ${environmentVariable}`
      );
    } else {
      return unvalidatedEnvironmentVariable;
    }
  };
  
  export const config = {
    url: getEnvironmentVariable("NEXT_PUBLIC_API_URL")
  };